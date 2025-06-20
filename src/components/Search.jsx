const Search = ({ searchItem, setSearchItem }) => {
	return (
		<div className="search">
			<div>
				<img src="search.svg" alt="search" />
				<input
                    type="text"
                    placeholder="Search for a movie"
					value={searchItem}
					onChange={(e) => setSearchItem(e.target.value)}
				/>
			</div>
		</div>
	);
};

export default Search;
