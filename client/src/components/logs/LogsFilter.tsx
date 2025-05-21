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
import { Calendar as CalendarIcon } from "lucide-react"; 
import { format } from "date-fns"; 
import { cn } from "@/lib/utils"; 
import { Calendar } from "@/components/ui/calendar"; 
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; 

interface LogsFilterProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  levelFilter: string;
  setLevelFilter: React.Dispatch<React.SetStateAction<string>>;
  handleSearchSubmit: (e: React.FormEvent) => void;
  startDate: Date | undefined;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  endDate: Date | undefined;
  setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

const LogsFilter: React.FC<LogsFilterProps> = ({
  search,
  setSearch,
  levelFilter,
  setLevelFilter,
  handleSearchSubmit,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}) => {
  return (
    <div className="flex gap-4 mb-6 flex-col md:flex-row items-start md:items-end">
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
        <SelectTrigger className="w-full md:w-[180px]">
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

      <div className="flex flex-col gap-1 w-full md:w-auto">
        <span className="text-sm font-medium text-muted-foreground">Start Date</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full md:w-[240px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-1 w-full md:w-auto">
        <span className="text-sm font-medium text-muted-foreground">End Date</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full md:w-[240px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
              disabled={(date) =>
                startDate ? date < startDate : false
              }
            />
          </PopoverContent>
        </Popover>
      </div>
      
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
