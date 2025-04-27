import { Star } from "lucide-react";

export default function RatingStars({ rating }: { rating: number }) {
    const stars = [];
  
    for (let i = 1; i <= 5; i++) {
      let fill = "none";
  
      if (i <= Math.floor(rating)) {
        fill = "#facc15"; 
      } else if (i - rating <= 1) {        
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
      const offset = Math.max(0, Math.min(1, rating - (i - 1))) * 100;
  
      gradients.push(
        <linearGradient id={`grad${i}`} key={`grad${i}`} x1="0" x2="100%" y1="0" y2="0">
          <stop offset={`${offset}%`} stopColor="#facc15" />
          <stop offset={`${offset}%`} stopColor="white" />
        </linearGradient>
      );
    }
  
    return (
      <>
        <svg width="0" height="0">
          <defs>{gradients}</defs>
        </svg>
        {stars}
      </>
    );
  };