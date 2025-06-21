const FilterControls = ({ selectedTypes, onTypeToggle, filteredPlacesCount }) => {
  return (
    <div className="text-center mb-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Nearby NGOs, Old Age Homes & Bhandars
      </h1>
      
      <div className="flex justify-center gap-4 mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedTypes.ngo}
            onChange={() => onTypeToggle('ngo')}
            className="form-checkbox h-4 w-4 text-red-600"
          />
          <span className="text-red-600 font-medium">NGOs (Red)</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedTypes.oldage}
            onChange={() => onTypeToggle('oldage')}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="text-blue-600 font-medium">Old Age Homes (Blue)</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedTypes.bhandar}
            onChange={() => onTypeToggle('bhandar')}
            className="form-checkbox h-4 w-4 text-green-600"
          />
          <span className="text-green-600 font-medium">Bhandars (Green)</span>
        </label>
      </div>
      
      <p className="text-gray-600">
        Found {filteredPlacesCount} places within 15km radius
      </p>
    </div>
  );
};

export default FilterControls;