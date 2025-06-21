import React from "react";

const PlacesList = ({
  loading,
  filteredPlaces,
  getCategoryColor,
  getCategoryDisplayName,
  handleGetDirections,
  openDonateModal,
  location, 
}) => {
  return (
    <div className="w-full lg:w-[30vw] h-[45vh] lg:h-[85vh] bg-white shadow-lg lg:shadow-2xl border lg:border-l border-green-200 flex flex-col rounded-lg lg:rounded-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 lg:p-6 text-white rounded-t-lg lg:rounded-t-2xl">
        <h2 className="text-lg lg:text-2xl font-bold">Nearby Places</h2>
        <p className="text-green-100 mt-1 text-sm lg:text-base">
          {filteredPlaces.length}{" "}
          {filteredPlaces.length === 1 ? "place" : "places"} found
        </p>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin h-5 lg:h-6 w-5 lg:w-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm lg:text-base">
                Loading places...
              </p>
            </div>
          </div>
        )}

        {!loading && filteredPlaces.length > 0 && (
          <div className="p-2 lg:p-4 space-y-2 lg:space-y-4">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                className="bg-white border border-gray-200 rounded-lg lg:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-400 overflow-hidden"
              >
                <img
                  src={
                    place.image ||
                    "https://t3.ftcdn.net/jpg/04/68/47/46/360_F_468474640_YcXTQsmw1U2sqnFG8vZyTq8SyoYsbvva.jpg"
                  }
                  alt={place.name}
                  className="w-full h-40 object-cover"
                />

                <div className="p-3 lg:p-5 pb-2 lg:pb-3">
                  <div className="flex items-start justify-between mb-2 lg:mb-3">
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-900 leading-tight pr-2 flex-1">
                      {place.name}
                    </h3>
                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                          place.category
                        )} whitespace-nowrap`}
                      >
                        {getCategoryDisplayName(place.category)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center mb-2 lg:mb-3">
                    <svg
                      className="w-3 lg:w-4 h-3 lg:h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2.293-2.293a1 1 0 011.414 0L12 14.586l5.293-5.293a1 1 0 011.414 0L21 12m-9-9v6m0 0l-3-3m3 3l3-3"
                      />
                    </svg>
                    <span className="text-xs lg:text-sm text-gray-600">
                      {place.distance} km away
                    </span>
                  </div>

                  <div className="flex items-start mb-2 lg:mb-3">
                    <svg
                      className="w-3 lg:w-4 h-3 lg:h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">
                      {place.address || "Address not available"}
                    </p>
                  </div>

                  <div className="space-y-1 lg:space-y-2 mb-3 lg:mb-4">
                    {place.phone && (
                      <div className="flex items-center">
                        <svg
                          className="w-3 lg:w-4 h-3 lg:h-4 text-gray-400 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <a
                          href={`tel:${place.phone}`}
                          className="text-xs lg:text-sm text-green-700 hover:text-green-900"
                        >
                          {place.phone}
                        </a>
                      </div>
                    )}
                    {place.website && (
                      <div className="flex items-center">
                        <svg
                          className="w-3 lg:w-4 h-3 lg:h-4 text-gray-400 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs lg:text-sm text-green-700 hover:text-green-900 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Get Directions Button */}
                <div className="px-3 lg:px-5 pb-3 lg:pb-5 flex gap-2">
                  <button
                    onClick={() => handleGetDirections(place)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 lg:py-3 px-3 lg:px-4 rounded-md lg:rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md text-sm lg:text-base cursor-pointer"
                  >
                    <svg
                      className="w-3 lg:w-4 h-3 lg:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                      />
                    </svg>
                    <span>Get Directions</span>
                  </button>
                  <button
                    onClick={() => openDonateModal(place)}
                    className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 px-3 rounded-md shadow text-sm border border-green-300 cursor-pointer"
                  >
                    Donate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filteredPlaces.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4 lg:p-8">
              <svg
                className="w-12 lg:w-16 h-12 lg:h-16 text-gray-300 mx-auto mb-3 lg:mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
                No places found
              </h3>
              <p className="text-gray-500 text-sm lg:text-base">
                Try adjusting your filter settings or check back later.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacesList;