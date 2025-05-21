import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface LogsFilterProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  levelFilter: string;
  setLevelFilter: React.Dispatch<React.SetStateAction<string>>;
  handleSearchSubmit: (e: React.FormEvent) => void;
}

const LogsFilter: React.FC<LogsFilterProps> = ({
  search,
  setSearch,
  levelFilter,
  setLevelFilter,
  handleSearchSubmit
}) => {
  return (
    <div className="flex gap-4 mb-6 flex-col md:flex-row">
      <div className="relative w-full md:w-1/2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={levelFilter}
        onValueChange={setLevelFilter}
      >
        <SelectTrigger className="w-full md:w-1/4">
          <SelectValue placeholder="Select Log Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="info">Info</SelectItem>
          <SelectItem value="error">Error</SelectItem>
          <SelectItem value="warn">Warning</SelectItem>
          <SelectItem value="debug">Debug</SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="submit"
        variant="default"
        size="default"
        className="focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={handleSearchSubmit}
      >
        Search
      </Button>
    </div>
  );
};

export default LogsFilter;
