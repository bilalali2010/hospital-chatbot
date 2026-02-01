// app/api/memory.js

let businessData = "";

export function setBusinessData(data) {
  businessData = data;
}

export function getBusinessData() {
  return businessData;
}
