const SortDropdown = ({ value, onChange }) => {
    return (
      <select className="sort-dropdown p-3 border border-gray-300 rounded-md shadow-sm" value={value} onChange={onChange}>
        <option value="">Sort by:</option>
        <option value="Price">Price</option>
        <option value="Rating">Rating</option>
      </select>
    );
  };
  
  export default SortDropdown;
  