// import Apple from "next-auth/providers/apple";
// import { CommonProviderConfig } from "./sso.config";
// experimental - might work correctly , not added currently
// const provider = {
//   id: "apple",
//   provider: Apple({
//     ...CommonProviderConfig,
//     profile: (profile) => {
//       return {
//         email: profile.email,
//         id: profile.sub.toString(),
//         image: null, // apple may not provide it or whatever
//         name: profile.user?.name
//           ? `${profile.user.name.firstName} ${profile.user.name.lastName}`
//           : undefined,
//         providerAccountId: profile.sub.toString(),
//       };
//     },
//   }),
// };

// export default provider;
