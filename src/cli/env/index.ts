import * as show from "./show.js";
import * as list from "./list.js";
import * as create from "./create.js";
import * as change from "./switch.js"; // `switch` is a JavaScript keyword
import * as remove from "./remove.js";
import * as cleardb from "./clear.js";
import * as upgrade from "./upgrade.js";
import * as populatedb from "./populate.js";
import * as promote from "./promote.js";
import { useOrganization, useToken } from "../../middleware/index.js";

export default function (_: any) {
  _.command([
    show,
    list,
    create,
    change,
    remove,
    upgrade,
    cleardb,
    populatedb,
    promote,
  ])
    .middleware([useToken, useOrganization])
    .demandCommand(1, "You need at least one command before moving on");
}
