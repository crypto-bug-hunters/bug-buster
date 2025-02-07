import React from "react";
import { Popover, Button, Checkbox, Badge, Group } from "@mantine/core";
import { IoFilter } from "react-icons/io5";

interface FilterPopoverProps {
    selectedFilters: string[];
    onFilterChange: (filters: string[]) => void;
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
    selectedFilters,
    onFilterChange,
}) => {
    const FILTER_OPTIONS = ["Open", "Expired", "Exploited"];

    const handleFilterToggle = (filter: string) => {
        onFilterChange(
            selectedFilters.includes(filter)
                ? selectedFilters.filter((f) => f !== filter)
                : [...selectedFilters, filter],
        );
    };

    return (
        <Group>
            <Popover trapFocus position="bottom" withArrow>
                <Popover.Target>
                    <Button>
                        <IoFilter size={24} />
                        Add Filter
                    </Button>
                </Popover.Target>
                <Popover.Dropdown>
                    {FILTER_OPTIONS.map((filter) => (
                        <Checkbox
                            key={filter}
                            label={filter}
                            checked={selectedFilters.includes(filter)}
                            onChange={() => handleFilterToggle(filter)}
                            mb="sm"
                        />
                    ))}
                </Popover.Dropdown>
            </Popover>

            {/* Display selected filters as badges */}
            <Group>
                {selectedFilters.map((filter) => (
                    <Badge key={filter} color="blue" variant="filled">
                        {filter}
                    </Badge>
                ))}
            </Group>
        </Group>
    );
};

export default FilterPopover;
