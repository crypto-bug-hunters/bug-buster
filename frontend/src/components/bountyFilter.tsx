import React from "react";
import {
    Popover,
    Button,
    Checkbox,
    Badge,
    Group,
    Divider,
    Flex,
    Radio,
} from "@mantine/core";
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
        <Flex
            direction={{ base: "column", sm: "row" }}
            justify={{ sm: "flex-start" }}
            w={{ base: 324, sm: 1024 }}
        >
            <Group>
                <Popover trapFocus position="bottom" withArrow>
                    <Popover.Target>
                        <Button
                            variant="subtle"
                            leftSection={<IoFilter size={24} />}
                        >
                            Add Filter
                        </Button>
                    </Popover.Target>
                    <Popover.Dropdown>
                        {FILTER_OPTIONS.map((filterOption) => (
                            <Radio
                                key={filterOption}
                                label={filterOption}
                                checked={
                                    filterOption.toLowerCase() ===
                                    selectedFilter.toLowerCase()
                                        ? true
                                        : false
                                }
                                onChange={() =>
                                    handleFilterToggle(filterOption)
                                }
                                mb="sm"
                            />
                        ))}
                        <Divider />
                        <Button mt={"sm"} onClick={() => onFilterChange("")}>
                            Clear filter
                        </Button>
                    </Popover.Dropdown>
                </Popover>

                {/* Display the selected filter as a badge */}
                {selectedFilter.length && (
                    <Badge color="blue" variant="filled">
                        {selectedFilter}
                    </Badge>
                )}
            </Group>
        </Flex>
    );
};

export default BountyFilter;
