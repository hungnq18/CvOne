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

export interface Country {
  name: string;
  code: string;
  phoneCode: string;
  flag: string;
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

export const getCountries = async (): Promise<Country[]> => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag');
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    const data = await response.json();

    const countries: Country[] = data
      .map((country: any) => {
        const phoneCode = country.idd?.root
          ? `${country.idd.root}${country.idd.suffixes?.[0] || ''}`
          : '';
        return {
          name: country.name.common,
          code: country.cca2,
          phoneCode: phoneCode || '',
          flag: country.flag || '',
        };
      })
      .filter((country: Country) => country.phoneCode) // Chỉ lấy các quốc gia có mã điện thoại
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

    return countries;
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};