import { BMapProvider, Map } from "react-bmap";

const BAIDU_MAP_AK = "pfDeQwmAwislusrWwBxzVVXLfXustbd7";

const BMapPage = () => {
  return (
    <div style={{ padding: 12 }}>
      <BMapProvider ak={BAIDU_MAP_AK} version="3.0">
        <Map
          center={{ lng: 116.402544, lat: 39.928216 }}
          zoom={11}
          enableScrollWheelZoom
          enableIconInfoWindow={false}
          style={{
            height: "calc(100vh - 120px)",
            width: "100%"
          }}
        />
      </BMapProvider>
    </div>
  );
};

export default BMapPage;
