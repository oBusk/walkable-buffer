import presets from "ts-jest/presets/index.js";
const { defaultsESM: tsjPreset } = presets;

export default {
    preset: "ts-jest",
    testEnvironment: "node",
    ...tsjPreset,
    moduleNameMapper: { "^(\\.|\\.\\.)\\/(.+)\\.js": "$1/$2" },
};
