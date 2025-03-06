import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    // Simulated fetch of announcements
    const fetchAnnouncements = async () => {
      try {
        // Replace this with an actual API call
        const mockAnnouncements = [
          {
            id: 1,
            title: "Spring Semester Registration Opens",
            date: "2024-03-15",
            description:
              "Registration for the upcoming spring semester will begin on March 20th. Please check your student portal for specific details and important dates.",
            category: "Academic",
          },
          {
            id: 2,
            title: "Campus Career Fair Updates",
            date: "2024-04-02",
            description:
              "Join us for the annual campus career fair featuring top employers from various industries. Networking and interview opportunities available.",
            category: "Career",
          },
          {
            id: 3,
            title: "Research Symposium Call for Papers",
            date: "2024-03-22",
            description:
              "Calling all researchers! Submit your research papers for the upcoming university research symposium. Deadline is April 15th.",
            category: "Research",
          },
          {
            id: 4,
            title: "Additional Announcement",
            date: "2024-03-22",
            description: "Additional announcement details go here.",
            category: "General",
          },
        ];

        setAnnouncements(mockAnnouncements);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch announcements");
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (isLoading) {
    return <div className="text-center p-4">Loading announcements...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[70vw] pt-8">
        <h2 className="text-2xl font-bold mb-6">University Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-gray-500">No announcements at this time.</p>
        ) : (
          <Swiper
            onSwiper={setSwiperInstance}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 30 },
            }}
          >
            {announcements.map((announcement) => (
              <SwiperSlide key={announcement.id}>
                <div className="border bg-blue-700 md:min-h-[40vh] xl:min-h-[20vh] border-slate-200 rounded-lg p-4 shadow-sm">
                  <h2 className="text-lg font-bold mb-2 text-white">
                    {announcement.title}
                  </h2>
                  <p className="text-sm text-white mb-2">{announcement.date}</p>
                  <p className="text-sm mb-2 text-gray-300 opacity-85"></p>
                  <p className="text-sm text-white">
                    {announcement.description}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        {/* Navigation Buttons Container */}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => swiperInstance && swiperInstance.slidePrev()}
            className="bg-white border-blue-600  px-4 py-2 rounded shadow"
          >
            ❮
          </button>
          <button
            onClick={() => swiperInstance && swiperInstance.slideNext()}
            className="bg-white border-blue-600  px-4 py-2 rounded shadow"
          >
            ❯
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementsPage;
