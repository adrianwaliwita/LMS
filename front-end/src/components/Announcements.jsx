import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import apiClient from "../api/apiClient";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function Announcements() {
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await apiClient.get("/announcements");
        setAllAnnouncements(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch announcements"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (allAnnouncements.length > 0) {
      const filtered = allAnnouncements.filter((announcement) => {
        // Show announcement if:
        // 1. It has no target batch (null/undefined), OR
        // 2. User has a matching enrolledBatch.id
        return (
          announcement.targetBatchId == null ||
          user?.enrolledBatch?.id === announcement.targetBatchId
        );
      });
      setFilteredAnnouncements(filtered);
    }
  }, [allAnnouncements, user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-blue-700">
        Loading announcements...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-red-500 p-4 text-center border-2 border-red-500 rounded-lg bg-red-50 max-w-[70vw]">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[300px] flex justify-start">
      <div className="max-w-[70vw] pt-8 w-full">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">
          University Announcements
        </h2>

        {filteredAnnouncements.length === 0 ? (
          <div className="min-h-[200px] border-2 border-blue-700 rounded-lg p-6 text-center bg-white flex items-center justify-center">
            <p className="text-gray-500">
              No announcements available for you at this time.
            </p>
          </div>
        ) : (
          <div className="relative min-h-[250px]">
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              navigation={{
                nextEl: ".announcement-next",
                prevEl: ".announcement-prev",
              }}
            >
              {filteredAnnouncements.map((announcement) => (
                <SwiperSlide key={announcement.id}>
                  <div className="border-2 border-blue-700 rounded-lg p-4 shadow-sm bg-blue-700 h-full flex flex-col min-h-[300px]">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white">
                        {announcement.title}
                      </h3>
                    </div>

                    <div className="mb-3 text-white text-sm flex-grow">
                      <p className="line-clamp-4">{announcement.content}</p>
                    </div>

                    <div className="mt-auto text-white text-xs">
                      <div className="mb-1">
                        <span className="font-semibold">Posted:</span>{" "}
                        {formatDate(announcement.createdAt)}
                      </div>
                      {announcement.date && (
                        <div>
                          <span className="font-semibold">Event Date:</span>{" "}
                          {formatDate(announcement.date)}
                        </div>
                      )}
                      <span className="text-xs text-blue-100 py-1 rounded">
                        {announcement.category}
                      </span>
                      {announcement.targetBatchId && (
                        <div className="text-xs text-blue-200 mt-1">
                          (For Batch: {announcement.targetBatchId})
                        </div>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="flex justify-end mt-4 space-x-2">
              <button className="announcement-prev bg-white border-2 border-blue-700 p-2 rounded-lg shadow hover:bg-blue-50">
                <FiChevronLeft className="h-5 w-5 text-blue-700" />
              </button>
              <button className="announcement-next bg-white border-2 border-blue-700 p-2 rounded-lg shadow hover:bg-blue-50">
                <FiChevronRight className="h-5 w-5 text-blue-700" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Announcements;
