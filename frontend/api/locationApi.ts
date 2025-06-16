export interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  districts?: District[];
}

export interface District {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
}

export const getProvinces = async (): Promise<Province[]> => {
  try {
    const response = await fetch('https://provinces.open-api.vn/api/p/');
    if (!response.ok) {
      throw new Error('Failed to fetch provinces');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return [];
  }
};

export const getDistrictsByProvinceCode = async (provinceCode: number): Promise<District[]> => {
  if (!provinceCode) return [];
  try {
    const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
    if (!response.ok) {
        throw new Error('Failed to fetch districts');
    }
    const data: Province = await response.json();
    return data.districts || [];
  } catch (error) {
    console.error("Error fetching districts:", error);
    return [];
  }
};