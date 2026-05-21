import { marqueeItems } from '../data/portfolioData';

export default function Marquee() {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div className="marquee-section">
      <div className="marquee-track">
        {items.map((item, i) => (
          <div className="marquee-item" key={i}>
            {item}
            <span className="separator">/</span>
          </div>
        ))}
      </div>
    </div>
  );
}
