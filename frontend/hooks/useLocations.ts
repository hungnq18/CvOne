import { useState, useEffect, useCallback } from "react";
import {
  getProvinces,
  getDistrictsByProvinceCode,
  Province,
  District,
} from "@/api/locationApi";

export const useLocations = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [recipientDistricts, setRecipientDistricts] = useState<District[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingRecipientDistricts, setIsLoadingRecipientDistricts] =
    useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const provinceData = await getProvinces();
        setProvinces(provinceData);
      } catch (err) {
        setError("Failed to fetch provinces.");
        // console.error(err);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  const fetchDistrictsForCity = useCallback(
    async (cityName: string) => {
      const selectedProvince = provinces.find((p) => p.name === cityName);
      if (!selectedProvince) {
        setDistricts([]);
        return;
      }
      setIsLoadingDistricts(true);
      try {
        const districtData = await getDistrictsByProvinceCode(
          selectedProvince.code
        );
        setDistricts(districtData);
      } catch (err) {
        setError("Failed to fetch districts.");
        // console.error(err);
      } finally {
        setIsLoadingDistricts(false);
      }
    },
    [provinces]
  );

  const fetchDistrictsForRecipientCity = useCallback(
    async (cityName: string) => {
      const selectedProvince = provinces.find((p) => p.name === cityName);
      if (!selectedProvince) {
        setRecipientDistricts([]);
        return;
      }
      setIsLoadingRecipientDistricts(true);
      try {
        const districtData = await getDistrictsByProvinceCode(
          selectedProvince.code
        );
        setRecipientDistricts(districtData);
      } catch (err) {
        setError("Failed to fetch recipient districts.");
        // console.error(err);
      } finally {
        setIsLoadingRecipientDistricts(false);
      }
    },
    [provinces]
  );

  return {
    provinces,
    districts,
    recipientDistricts,
    isLoadingProvinces,
    isLoadingDistricts,
    isLoadingRecipientDistricts,
    error,
    fetchDistrictsForCity,
    fetchDistrictsForRecipientCity,
  };
};
