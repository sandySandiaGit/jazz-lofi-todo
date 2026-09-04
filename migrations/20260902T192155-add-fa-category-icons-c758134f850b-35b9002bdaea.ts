import { schema as s } from "jazz-tools";

export default s.defineMigration({
  migrate: {
    "categories": {
      // TODO: Added required column "iconKey" needs an explicit default.
       //Use of the s.add builder method to supply the default value:
      "iconKey": s.add.string({ default: "briefcase" })
    },
  },
  fromHash: "c758134f850b",
  toHash: "35b9002bdaea",
  from: {
  "categories": s.table({
    "name": s.string(),
    "color": s.string(),
  })
},
  to: {
  "categories": s.table({
    "name": s.string(),
    "color": s.string(),
    "iconKey": s.string(),
  })
},
});
