"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@radix-ui+react-use-previous@1.1.1_@types+react@18.3.23_react@18.3.1";
exports.ids = ["vendor-chunks/@radix-ui+react-use-previous@1.1.1_@types+react@18.3.23_react@18.3.1"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/@radix-ui+react-use-previous@1.1.1_@types+react@18.3.23_react@18.3.1/node_modules/@radix-ui/react-use-previous/dist/index.mjs":
/*!**********************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@radix-ui+react-use-previous@1.1.1_@types+react@18.3.23_react@18.3.1/node_modules/@radix-ui/react-use-previous/dist/index.mjs ***!
  \**********************************************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   usePrevious: () => (/* binding */ usePrevious)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/.pnpm/next@14.0.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n// packages/react/use-previous/src/use-previous.tsx\n\nfunction usePrevious(value) {\n  const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef({ value, previous: value });\n  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => {\n    if (ref.current.value !== value) {\n      ref.current.previous = ref.current.value;\n      ref.current.value = value;\n    }\n    return ref.current.previous;\n  }, [value]);\n}\n\n//# sourceMappingURL=index.mjs.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vQHJhZGl4LXVpK3JlYWN0LXVzZS1wcmV2aW91c0AxLjEuMV9AdHlwZXMrcmVhY3RAMTguMy4yM19yZWFjdEAxOC4zLjEvbm9kZV9tb2R1bGVzL0ByYWRpeC11aS9yZWFjdC11c2UtcHJldmlvdXMvZGlzdC9pbmRleC5tanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUMrQjtBQUMvQjtBQUNBLGNBQWMseUNBQVksR0FBRyx3QkFBd0I7QUFDckQsU0FBUywwQ0FBYTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBR0U7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2Zyb250ZW5kLy4vbm9kZV9tb2R1bGVzLy5wbnBtL0ByYWRpeC11aStyZWFjdC11c2UtcHJldmlvdXNAMS4xLjFfQHR5cGVzK3JlYWN0QDE4LjMuMjNfcmVhY3RAMTguMy4xL25vZGVfbW9kdWxlcy9AcmFkaXgtdWkvcmVhY3QtdXNlLXByZXZpb3VzL2Rpc3QvaW5kZXgubWpzP2E0ODgiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gcGFja2FnZXMvcmVhY3QvdXNlLXByZXZpb3VzL3NyYy91c2UtcHJldmlvdXMudHN4XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmZ1bmN0aW9uIHVzZVByZXZpb3VzKHZhbHVlKSB7XG4gIGNvbnN0IHJlZiA9IFJlYWN0LnVzZVJlZih7IHZhbHVlLCBwcmV2aW91czogdmFsdWUgfSk7XG4gIHJldHVybiBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICBpZiAocmVmLmN1cnJlbnQudmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICByZWYuY3VycmVudC5wcmV2aW91cyA9IHJlZi5jdXJyZW50LnZhbHVlO1xuICAgICAgcmVmLmN1cnJlbnQudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlZi5jdXJyZW50LnByZXZpb3VzO1xuICB9LCBbdmFsdWVdKTtcbn1cbmV4cG9ydCB7XG4gIHVzZVByZXZpb3VzXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcFxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/@radix-ui+react-use-previous@1.1.1_@types+react@18.3.23_react@18.3.1/node_modules/@radix-ui/react-use-previous/dist/index.mjs\n");

/***/ })

};
;