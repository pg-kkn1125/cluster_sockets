const convertResponseData = (data, isBinary) => {
  if (isBinary) {
    const decoder = new TextDecoder();
    const decodedText = decoder.decode(data);
    const parsedData = decodedText
      .split(",")
      .map((bi) => String.fromCharCode(parseInt(Number(bi), 2)))
      .join("");
    return parsedData;
  }
  return data;
};

module.exports = { convertResponseData };
