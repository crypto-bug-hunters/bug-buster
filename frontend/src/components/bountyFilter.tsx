import React from "react";
import { Popover, Button, Checkbox, Badge, Group } from "@mantine/core";
import { IoFilter } from "react-icons/io5";

interface BountyFilterProps {
    selectedFilter: string;
    onFilterChange: (filterChange: string) => void;
}

const BountyFilter: React.FC<BountyFilterProps> = ({
    selectedFilter,
    onFilterChange,
}) => {
    const FILTER_OPTIONS = ["Open", "Expired", "Exploited"];

    const handleFilterToggle = (filterChange: string) => {
        onFilterChange(filterChange);
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
                    {FILTER_OPTIONS.map((filterOption) => (
                        <Checkbox
                            key={filterOption}
                            label={filterOption}
                            checked={
                                filterOption === selectedFilter ? true : false
                            }
                            onChange={() => handleFilterToggle(filterOption)}
                            mb="sm"
                        />
                    ))}
                </Popover.Dropdown>
            </Popover>

            {/* Display selected filters as badges */}
            <Group>
                {selectedFilter.length && (
                    <Badge color="blue" variant="filled">
                        {selectedFilter}
                    </Badge>
                )}
            </Group>
        </Group>
    );
};

export default BountyFilter;
