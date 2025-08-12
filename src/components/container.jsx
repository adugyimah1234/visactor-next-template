var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
const Container = forwardRef(function Container(_a, ref) {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<div ref={ref} className={cn("max-w-8xl mx-auto w-full px-6 tablet:px-10 desktop:px-14", className)} {...props}>
      {children}
    </div>);
});
export default Container;
