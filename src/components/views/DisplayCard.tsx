import { useEffect, useRef, useState } from "react";
import "../../styles/components/DisplayCard.scss";
type DisplayCardProps = {
  value: string;
  displayType: string;
  icon: string;
};

const DisplayCard = ({ icon, value, displayType }: DisplayCardProps) => {
  const [countup, setCountUp] = useState(0);
  const refVal = useRef(0);
  const accumulator = Math.floor(parseInt(value) / 200);

  const countUpdater = () => {
    if (refVal.current < parseInt(value)) {
      const result = Math.ceil(refVal.current + accumulator);
      if (result > parseInt(value)) return setCountUp(parseInt(value));
      setCountUp(result);
      refVal.current = result;
    }
    setTimeout(countUpdater, 5);
  };

  useEffect(() => {
    let isMounted = true;

    if (isMounted) countUpdater();
    return () => {
      isMounted = false;
    };
  }, [value]);

  return (
    <div className="container">
      <div>
        <img src={icon} alt={`${name} logo`} className="icon" />
      </div>
      <p className="mg-0">{displayType}</p>
      <p key={new Date().getMilliseconds()} className="mg-0">
        {countup}
      </p>
    </div>
  );
};

export default DisplayCard;
