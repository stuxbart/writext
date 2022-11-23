import React from "react";
import "./SideMenuFiltersList.scss";

export type FilterProps = {
  title: string;
  active?: boolean;
};

type SideMenyFiltersListProps = {
  title?: string;
  filters: FilterProps[];
  onFilterSelect: CallableFunction;
};

function SideMenuFiltersList({
  title="Filters",
  filters,
  onFilterSelect,
}: SideMenyFiltersListProps): JSX.Element {
  const ACTIVE_CLASS_NAME = "projects__folder-list_li--active";

  return (
    <div className="projects__folder-list">
      <h3 className="projects__folder-list_h">{title}</h3>
      <ul className="projects__folder-list_ul">
        {filters.map((filter, index) => (
          <li
            key={index}
            className={`projects__folder-list_li ${
              filter.active && ACTIVE_CLASS_NAME
            }`}
            onClick={() => onFilterSelect(index)}
          >
            {filter.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SideMenuFiltersList;
