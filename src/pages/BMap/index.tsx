import { Map } from "react-bmap";

const BMapPage = () => {
  return (
    <div style={{ padding: 12 }}>
      <Map
        center={{ lng: 116.402544, lat: 39.928216 }}
        zoom="11"
        style={{
          height: "calc(100vh - 120px)",
          width: "100%",
        }}
      ></Map>
    </div>
  );
};

export default BMapPage;
