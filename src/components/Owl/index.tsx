import closeEyesImg from "./close-eyes.png";
import face from "./face.png";
import handDownLeft from "./hand-down-left.png";
import handDownRight from "./hand-down-right.png";
import handUpLeft from "./hand-up-left.png";
import handUpRight from "./hand-up-right.png";

const bg = (url: string) =>
  ({
    backgroundImage: `url(${url})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100%"
  }) as const;

const Owl = ({ closeEyes }: { closeEyes: boolean }) => {
  return (
    <div className="relative z-[3] h-[95px] bg-transparent">
      <div className="absolute left-1/2 -translate-x-1/2">
        <div className="relative h-[95px] w-[120px] translate-y-[12%]" style={bg(face)}>
          <div
            className={`absolute bottom-[3px] left-[-35px] z-[2] h-[25px] w-[45px] transition-transform duration-200 ease-linear ${
              closeEyes ? "translate-x-[30px] scale-0 -translate-y-2.5" : ""
            }`}
            style={bg(handDownLeft)}
          />
          <div
            className={`absolute right-[-40px] bottom-[3px] z-[2] h-[25px] w-[45px] transition-transform duration-200 ease-linear ${
              closeEyes ? "-translate-x-10 scale-0 -translate-y-2.5" : ""
            }`}
            style={bg(handDownRight)}
          />
          <div
            className={`absolute bottom-[11px] left-[-5px] z-[3] h-10 w-[50px] transition-opacity delay-100 duration-100 ease-linear ${
              closeEyes ? "opacity-100" : "opacity-0"
            }`}
            style={bg(handUpLeft)}
          />
          <div
            className={`absolute right-[5px] bottom-[11px] z-[3] h-10 w-[50px] transition-opacity delay-100 duration-100 ease-linear ${
              closeEyes ? "opacity-100" : "opacity-0"
            }`}
            style={bg(handUpRight)}
          />
          <div
            className={`z-[1] h-full w-full transition-opacity delay-100 duration-100 ease-linear ${
              closeEyes ? "opacity-100" : "opacity-0"
            }`}
            style={bg(closeEyesImg)}
          />
        </div>
      </div>
    </div>
  );
};

export default Owl;
