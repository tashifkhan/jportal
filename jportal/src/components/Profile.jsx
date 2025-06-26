import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { useSwipeable } from "react-swipeable";

export default function Profile({ w, profileData, setProfileData }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  // Tab order for swiping
  const tabOrder = ["personal", "academic", "contact", "education"];

  // Swipe handlers for tab navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex < tabOrder.length - 1) {
        setActiveTab(tabOrder[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabOrder[currentIndex - 1]);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 50,
    swipeDuration: 500,
  });

  // State to toggle between profile image and avatar
  const [showProfilePhoto, setShowProfilePhoto] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      // Return early if data is already cached
      if (profileData) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await w.get_personal_info();
        setProfileData(data);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [w, profileData, setProfileData]);

  if (loading) {
    return <Loader message="Loading profile..." />;
  }

  const info = profileData?.generalinformation || {};
  const qualifications = profileData?.qualification || [];

  // Prepare both image sources
  const photoData = profileData?.["photo&signature"]?.photo;
  const hasProfilePhoto = Boolean(photoData);
  const avatarImg =
    info.profileimgurl ||
    "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(info.studentname || "User") +
      "&background=0D8ABC&color=fff&size=128";
  const profileImg = hasProfilePhoto
    ? `data:image/jpeg;base64,${photoData}`
    : avatarImg;

  return (
    <div className="min-h-[calc(100vh-10rem)] md:min-h-[calc(100vh-6rem)] flex flex-col w-full">
      <div className="flex-1 flex flex-row w-full max-w-6xl mx-auto">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex w-full"
        >
          {/* Sidebar Tabs for large screens, horizontal for small */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <TabsList className="mb-6 bg-[var(--card-bg)] rounded-[var(--radius)] overflow-hidden items-center grid grid-cols-1 w-64 h-auto py-4 gap-2 shadow-xl ">
              <TabsTrigger
                value="personal"
                className="flex items-center justify-start px-6 py-3 w-full rounded-none data-[state=active]:rounded-2xl data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--text-color)] text-[var(--label-color)] text-[1.1rem] font-medium transition-colors"
              >
                Personal
              </TabsTrigger>
              <TabsTrigger
                value="academic"
                className="flex items-center justify-start px-6 py-3 w-full rounded-none data-[state=active]:rounded-2xl data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--text-color)] text-[var(--label-color)] text-[1.1rem] font-medium transition-colors"
              >
                Academic
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="flex items-center justify-start px-6 py-3 w-full rounded-none data-[state=active]:rounded-2xl data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--text-color)] text-[var(--label-color)] text-[1.1rem] font-medium transition-colors"
              >
                Contact
              </TabsTrigger>
              <TabsTrigger
                value="education"
                className="flex items-center justify-start px-6 py-3 w-full rounded-none data-[state=active]:rounded-2xl data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--text-color)] text-[var(--label-color)] text-[1.1rem] font-medium transition-colors"
              >
                Education
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Info Card (Main Card) */}
          <div
            className="flex-1 flex flex-col items-center w-full px-4 sm:px-0"
            {...swipeHandlers}
          >
            {/* Profile Image & Header */}
            <div className="flex flex-col items-center w-full pt-8 pb-4 px-2 sm:px-0 relative">
              {hasProfilePhoto && (
                <button
                  className="absolute top-0 right-0 mt-2 mr-2 px-3 py-1 rounded-lg bg-[var(--primary-color)] text-[var(--text-color)] border-none text-sm hover:bg-[var(--accent-color)] hover:text-[var(--card-bg)] transition-colors z-10"
                  onClick={() => setShowProfilePhoto((prev) => !prev)}
                  title={showProfilePhoto ? "Show Avatar" : "Show Photo"}
                >
                  {showProfilePhoto ? "Show Avatar" : "Show Photo"}
                </button>
              )}
              <img
                src={
                  showProfilePhoto && hasProfilePhoto ? profileImg : avatarImg
                }
                alt="Profile"
                className={`w-28 h-28 rounded-full object-cover shadow-md mb-4${
                  !showProfilePhoto || !hasProfilePhoto
                    ? " border-4 border-[var(--accent-color)]"
                    : ""
                }`}
                style={{ background: "var(--primary-color)" }}
              />
              <div className="text-2xl font-bold text-[var(--text-color)] text-center mb-1">
                {info.studentname || "N/A"}
              </div>
              <div className="text-base font-medium text-[var(--label-color)] text-center mb-1">
                {info.registrationno || "N/A"} | {info.programcode || ""}
                {info.branch ? ` - ${info.branch}` : ""}
              </div>
            </div>
            {/* TabsList for mobile only */}
            <div className="w-full lg:hidden">
              <TabsList className="w-full flex flex-row justify-between bg-[var(--primary-color)] rounded-t-2xl overflow-hidden h-12">
                <TabsTrigger
                  value="personal"
                  className="flex-1 text-lg font-semibold data-[state=active]:bg-[var(--card-bg)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors"
                >
                  Personal
                </TabsTrigger>
                <TabsTrigger
                  value="academic"
                  className="flex-1 text-lg font-semibold data-[state=active]:bg-[var(--card-bg)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors"
                >
                  Academic
                </TabsTrigger>
                <TabsTrigger
                  value="contact"
                  className="flex-1 text-lg font-semibold data-[state=active]:bg-[var(--card-bg)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors"
                >
                  Contact
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="flex-1 text-lg font-semibold data-[state=active]:bg-[var(--card-bg)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors"
                >
                  Education
                </TabsTrigger>
              </TabsList>
            </div>
            {/* Content Area */}
            <div className="w-full">
              <TabsContent value="personal" className="px-4 sm:px-8 py-6">
                <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
                  <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm px-4 sm:px-6 py-5">
                    <SectionTitle>Personal Details</SectionTitle>
                    <InfoRow label="Date of Birth" value={info.dateofbirth} />
                    <InfoRow label="Gender" value={info.gender} />
                    <InfoRow label="Blood Group" value={info.bloodgroup} />
                    <InfoRow label="Nationality" value={info.nationality} />
                    <InfoRow label="Category" value={info.category} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="academic" className="px-4 sm:px-8 py-6">
                <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
                  <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm px-4 sm:px-6 py-5">
                    <SectionTitle>Academic Details</SectionTitle>
                    <InfoRow label="Program" value={info.programcode} />
                    <InfoRow label="Branch" value={info.branch} />
                    <InfoRow label="Section" value={info.sectioncode} />
                    <InfoRow label="Batch" value={info.batch} />
                    <InfoRow label="Semester" value={info.semester} />
                    <InfoRow label="Institute" value={info.institutecode} />
                    <InfoRow label="Academic Year" value={info.academicyear} />
                    <InfoRow
                      label="Admission Year"
                      value={info.admissionyear}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="contact" className="px-4 sm:px-8 py-6">
                <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
                  <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm px-4 sm:px-6 py-5">
                    <SectionTitle>Student Contact</SectionTitle>
                    <InfoRow
                      label="Student Email (College)"
                      value={info.studentemailid}
                    />
                    <InfoRow
                      label="Student Email (Personal)"
                      value={info.studentpersonalemailid}
                    />
                    <InfoRow label="Mobile" value={info.studentcellno} />
                    <InfoRow
                      label="Telephone"
                      value={info.studenttelephoneno || "N/A"}
                    />
                  </div>
                  <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm px-4 sm:px-6 py-5">
                    <SectionTitle>Family Information</SectionTitle>
                    <InfoRow label="Father's Name" value={info.fathersname} />
                    <InfoRow label="Mother's Name" value={info.mothername} />
                    <InfoRow
                      label="Parent's Email"
                      value={info.parentemailid}
                    />
                    <InfoRow
                      label="Parent's Mobile"
                      value={info.parentcellno}
                    />
                    <InfoRow
                      label="Parent's Telephone"
                      value={info.parenttelephoneno || "N/A"}
                    />
                  </div>
                  <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm px-4 sm:px-6 py-5">
                    <SectionTitle>Current Address</SectionTitle>
                    <InfoRow
                      label="Address"
                      value={[info.caddress1, info.caddress3]
                        .filter(Boolean)
                        .join(", ")}
                    />
                    <InfoRow label="City" value={info.ccityname} />
                    <InfoRow label="District" value={info.cdistrict} />
                    <InfoRow label="State" value={info.cstatename} />
                    <InfoRow label="Postal Code" value={info.cpostalcode} />
                  </div>
                  <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm px-4 sm:px-6 py-5">
                    <SectionTitle>Permanent Address</SectionTitle>
                    <InfoRow
                      label="Address"
                      value={[info.paddress1, info.paddress2, info.paddress3]
                        .filter(Boolean)
                        .join(", ")}
                    />
                    <InfoRow label="City" value={info.pcityname} />
                    <InfoRow label="District" value={info.pdistrict} />
                    <InfoRow label="State" value={info.pstatename} />
                    <InfoRow label="Postal Code" value={info.ppostalcode} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="education" className="px-4 sm:px-8 py-6">
                <div className="w-full max-w-2xl mx-auto">
                  {qualifications.length === 0 ? (
                    <div className="text-[var(--label-color)] text-center py-4">
                      No qualifications found.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {qualifications.map((qual, index) => (
                        <div
                          key={index}
                          className="bg-[var(--card-bg)] rounded-2xl shadow-sm px-4 sm:px-6 py-5 flex flex-col gap-1"
                        >
                          <SectionTitle>{`Qualification: ${qual.qualificationcode}`}</SectionTitle>
                          <InfoRow label="Board" value={qual.boardname} />
                          <InfoRow
                            label="Year of Passing"
                            value={qual.yearofpassing}
                          />
                          <InfoRow
                            label="Marks Obtained"
                            value={`${qual.obtainedmarks}/${qual.fullmarks}`}
                          />
                          <InfoRow
                            label="Percentage"
                            value={`${qual.percentagemarks}%`}
                          />
                          <InfoRow label="Division" value={qual.division} />
                          {qual.grade && (
                            <InfoRow label="Grade" value={qual.grade} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
      {/* Footer remains full width below the card */}
      <div className="w-full max-w-4xl mx-auto bg-[var(--card-bg)] rounded-2xl shadow-sm px-4 sm:px-6 py-4 text-center overflow-auto max-sm:text-sm text-lg mt-6">
        Made with Big 🍆 Energy by{" "}
        <a
          href="https://github.com/codeblech"
          className="text-[var(--accent-color)]"
        >
          Yash Malik
        </a>
      </div>
    </div>
  );
}

// Helper for section titles
function SectionTitle({ children, className = "" }) {
  return (
    <h2
      className={`text-xl font-semibold mb-4 text-[var(--accent-color)] ${className}`}
    >
      {children}
    </h2>
  );
}

// Helper component for consistent info display
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-row justify-between items-center py-2">
      <span className="text-[var(--label-color)] font-medium">{label}:</span>
      <span className="text-[var(--text-color)] font-semibold break-words text-right ml-2">
        {value || "N/A"}
      </span>
    </div>
  );
}
