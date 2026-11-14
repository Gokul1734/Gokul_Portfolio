import { useRef } from "react";

const AdminTrigger = ({ onAdminOpen, onHome, className, children }) => {
  const taps = useRef({ count: 0, lastTap: 0 });

  const handleClick = () => {
    onHome?.();

    const now = Date.now();
    if (now - taps.current.lastTap > 1800) {
      taps.current.count = 0;
    }

    taps.current.count += 1;
    taps.current.lastTap = now;
    if (taps.current.count >= 5) {
      taps.current.count = 0;
      onAdminOpen?.();
    }
  };

  return (
    <button
      type="button"
      className={className}
      aria-label="Back to home"
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default AdminTrigger;
