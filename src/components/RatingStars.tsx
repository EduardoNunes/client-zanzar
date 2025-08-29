import { Star } from "lucide-react";

export default function RatingStars({ rating }: { rating: number }) {
    const safeRating = typeof rating === "number" && !isNaN(rating) ? rating : 0;
    const stars = [];
  
    for (let i = 1; i <= 5; i++) {
      let fill = "none";
  
      if (i <= Math.floor(safeRating)) {
        fill = "#facc15"; 
      } else if (i - safeRating <= 1) {        
        fill = `url(#grad${i})`;
      }
  
      stars.push(
        <Star
          key={i}
          size={18}
          fill={fill}
          stroke="#facc15"
          className="inline-block mr-1"
        />
      );
    }  
    
    const gradients = [];
    for (let i = 1; i <= 5; i++) {
      const offsetRaw = Math.max(0, Math.min(1, safeRating - (i - 1)));
      const offset = isNaN(offsetRaw) ? 0 : offsetRaw * 100;
  
      gradients.push(
        <linearGradient id={`grad${i}`} key={`grad${i}`} x1="0" x2="100%" y1="0" y2="0">
          <stop offset={`${offset}%`} stopColor="#facc15" />
          <stop offset={`${offset}%`} stopColor="white" />
        </linearGradient>
      );
    }
  
    return (
      <div className="flex">
        <svg width="0" height="0">
          <defs>{gradients}</defs>
        </svg>
        {stars}
      </ div>
    );
  };