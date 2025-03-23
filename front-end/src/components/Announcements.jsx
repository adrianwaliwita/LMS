import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    axios
      .get(`${baseUrl}/announcements`)
      .then((response) => {
        setAnnouncements(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching announcements:", error);
        setLoading(false);
      });
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
