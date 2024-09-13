// import axios from "./axios";
// import { useAuth } from "~/utils/helpers";
// import { setUserData, getUserData } from "~/utils/helpers";

// const useRefreshToken = () => {
//   const { setUserGlobal } = useAuth();
//   const user = getUserData();

//   const refresh = async () => {
//     try {
//       const response = await axios.post("/api/v1/users/refresh-token", {
//         refreshToken: user?.refreshToken || ""
//       });
//       setUserData({ ...user, accessToken: response.data.token });
//       setUserGlobal((prev: any) => ({ ...prev, accessToken: response.data.token }));
//       return response.data.token;
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return refresh;
// };

// export default useRefreshToken;
