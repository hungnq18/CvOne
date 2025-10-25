"use client";
import { CL, createCL, CreateCLDto, getCLs } from "@/api/clApi";
import { CV, getAllCVs } from "@/api/cvapi";
import CoverLetterList from "@/components/sections/listMyCL";
import CVList from "@/components/sections/listMyCV";
import { useLanguage } from "@/providers/global_provider";
import "@/styles/myDocuments.css";
import { Tabs } from "antd";
import { useEffect, useState } from "react";

const translations = {
  en: {
    tabs: {
      cv: "CV",
      coverLetter: "Cover Letters",
    },
    search: {
      placeholder: "Search",
    },
    viewMode: {
      grid: "Grid",
      list: "List",
    },
  },
  vi: {
    tabs: {
      cv: "CV",
      coverLetter: "Thư xin việc",
    },
    search: {
      placeholder: "Tìm kiếm",
    },
    viewMode: {
      grid: "Lưới",
      list: "Danh sách",
    },
  },
};

export default function Page() {
  const [activeTab, setActiveTab] = useState("1");
  const [searchValue, setSearchValue] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { language } = useLanguage();
  const t = translations[language];

  const [coverLetterList, setCoverLetterList] = useState<CL[]>([]);
  const [loadingCL, setLoadingCL] = useState(true);

  const [cvList, setcvList] = useState<CV[]>([]);
  const [loadingCV, setLoadingCV] = useState(true);

  useEffect(() => {
    const processPendingCL = async () => {
      const pendingCLJSON = localStorage.getItem("pendingCL");
      if (pendingCLJSON) {
        // Remove immediately to prevent duplicate saves on re-renders
        localStorage.removeItem("pendingCL");
        try {
          const pendingCL = JSON.parse(pendingCLJSON);
          const { letterData, templateId } = pendingCL;

          if (letterData && templateId) {
            const newCL: CreateCLDto = {
              templateId: templateId,
              title: letterData.subject || "Untitled Cover Letter",
              data: letterData,
              isSaved: true,
            };
            await createCL(newCL);
            alert("Your pending cover letter has been saved successfully!");
            // After saving, we can trigger a reload of the cover letters
            // The second useEffect will handle fetching the updated list.
            setCoverLetterList(prevList => [...prevList, newCL as CL]); // Optimistic update
            loadCoverLetters(); //
          }
        } catch (error) {
          console.error("Failed to save pending cover letter:", error);
          alert("There was an error saving your pending cover letter.");
          // Optional: If saving fails, you might want to put it back into localStorage
          // localStorage.setItem("pendingCL", pendingCLJSON);
        }
      }
    };

    processPendingCL();
  }, []); // Run only once on component mount

  const loadCoverLetters = async () => {
    setLoadingCL(true);
    try {
      const clData = await getCLs();
      setCoverLetterList(clData || []);
    } catch (error) {
      console.error("Failed to fetch cover letters:", error);
    } finally {
      setLoadingCL(false);
    }
  };

  useEffect(() => {
    loadCoverLetters();

    const loadCV = async () => {
      setLoadingCV(true);
      try {
        const [cvs] = await Promise.all([getAllCVs()]);
        setcvList(cvs);
        setLoadingCV(false);
      } catch (err) {
        console.error("Lỗi khi gọi getAllCVs hoặc getAllTemplates:", err);
      }
    };
    loadCV();
  }, [language]);

  const onTabChange = (key: string) => setActiveTab(key);
  const onSearch = (value: string) => setSearchValue(value);

  const filteredCVList = cvList.filter((cv) =>
    cv.title?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const filteredCoverLetterList = coverLetterList.filter((cl) =>
    cl.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  const items = [
    {
      key: "1",
      label: `${t.tabs.cv} (${cvList.length})`,
      children: null,
    },
    {
      key: "2",
      label: `${t.tabs.coverLetter} (${filteredCoverLetterList.length})`,
      children: null,
    },
  ];

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="p-2 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Tabs
              activeKey={activeTab}
              onChange={onTabChange}
              items={items}
              className="flex-1 min-w-0"
            />
            <div className="flex items-center space-x-4">
              <form className="relative w-full sm:w-auto" onSubmit={e => e.preventDefault()}>
                <button type="submit" className="absolute left-2 -translate-y-1/2 top-1/2 p-1">
                  <svg
                    width="17"
                    height="16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-labelledby="search"
                    className="w-4 h-4 text-gray-700"
                  >
                    <path
                      d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                      stroke="currentColor"
                      strokeWidth="1.333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </button>
                <input
                  className="rounded-full px-8 py-2 text-sm border-2 border-blue-500 focus:border-blue-700 placeholder-gray-400 transition-all duration-300 w-full shadow-[0_0_0_3px_#3b82f633] focus:shadow-[0_0_0_3px_#1d4ed866] focus:outline-none"
                  type="text"
                  placeholder={t.search.placeholder}
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                />
                {searchValue && (
                  <button type="button" onClick={() => setSearchValue('')} className="absolute right-3 -translate-y-1/2 top-1/2 p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                )}
              </form>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as "grid" | "list")}
                className="h-10 px-3 border border-gray-300 rounded"
              >
                <option value="grid">{t.viewMode.grid}</option>
                <option value="list">{t.viewMode.list}</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          {activeTab === "1" && (
            <CVList cvList={filteredCVList} viewMode={viewMode} />
          )}
          {activeTab === "2" &&
            (loadingCL ? (
              <p>Loading Cover Letters...</p>
            ) : (
              <CoverLetterList
                coverLetters={filteredCoverLetterList}
                viewMode={viewMode}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
