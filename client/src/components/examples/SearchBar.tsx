import { useState } from 'react';
import SearchBar from '../SearchBar';

export default function SearchBarExample() {
  const [search, setSearch] = useState('');
  
  return (
    <div className="p-8 max-w-2xl">
      <SearchBar value={search} onChange={setSearch} />
      {search && <p className="mt-4 text-sm text-muted-foreground">Searching for: {search}</p>}
    </div>
  );
}
