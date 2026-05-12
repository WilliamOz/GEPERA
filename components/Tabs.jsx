"use client";

import { useState } from "react";

export default function Tabs({ items = [] }) {
  const [active, setActive] = useState(0);
  if (!items.length) return null;

  return (
    <div className="tab-system">
      <div className="tab-list" role="tablist">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={index === active ? "active" : ""}
            onClick={() => setActive(index)}
          >
            {item.title}
          </button>
        ))}
      </div>
      <article className="glass-panel tab-panel-next">
        <p>{items[active].body}</p>
      </article>
    </div>
  );
}
