import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import axios from "axios";
import apiClient from "../api/apiClient";
const baseUrl = import.meta.env.VITE_BASE_URL;

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await apiClient.get("/announcements");
        setAnnouncements(response.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        const errorMessage =
          error.response?.data?.message || "Failed to fetch announcements";
        setError(errorMessage);
        toast.error(errorMessage);
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
                <div className="border bg-blue-700 md:min-h-[40vh] xl:min-h-[20vh] border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
                  <h2 className="text-lg font-bold mb-2 text-white">
                    {announcement.title}
                  </h2>

                  <div className="mb-2 text-sm text-white">
                    <span className="font-semibold">Posted:</span>{" "}
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </div>

                  <div className="mb-3 text-white">
                    <p className="text-sm">{announcement.content}</p>
                  </div>

                  <div className="mt-auto text-sm text-white">
                    <div className="mb-1">
                      <span className="font-semibold">Category:</span>{" "}
                      {announcement.category}
                    </div>
                    {announcement.date && (
                      <div className="font-bold">
                        <span className="font-bold">Event Date:</span>{" "}
                        {announcement.date}
                      </div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        {/* Navigation Buttons Container */}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => swiperInstance && swiperInstance.slidePrev()}
            className="bg-white border-blue-600 px-4 py-2 rounded shadow"
          >
            ❮
          </button>
          <button
            onClick={() => swiperInstance && swiperInstance.slideNext()}
            className="bg-white border-blue-600 px-4 py-2 rounded shadow"
          >
            ❯
          </button>
        </div>
      </div>
    </div>
  );
}

export default Announcements;
