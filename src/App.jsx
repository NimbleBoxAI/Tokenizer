import { useState } from "react";
import cl100k_base from "gpt-tokenizer";
import React from "react";
import { MistralTokenizer } from "mistral-tokenizer-ts";
import llamaTokenizer from "llama-tokenizer-js";
import "./App.css";

const tokenizers = {
  cl100k_base,
  llamaTokenizer,
  MistralTokenizer,
};

const pastelColors = [
  "rgba(107,64,216,.3)",
  "rgba(104,222,122,.4)",
  "rgba(244,172,54,.4)",
  "rgba(239,65,70,.4)",
  "rgba(39,181,234,.4)",
];

const monospace = `"Roboto Mono",sfmono-regular,consolas,liberation mono,menlo,courier,monospace`;

const TextInput = ({ value, onChange }) => (
  <textarea
    value={value}
    onChange={onChange}
    className="text_area"
    placeholder="Enter text..."
  />
);

const TokenizedText = ({ tokens }) => {
  return (
    <div className="token_div">
      {tokens.map((token, index) => {
        if (
          token.startsWith("\n") ||
          token.startsWith("<0x0A>") ||
          token.startsWith("<newline>")
        ) {
          return <br key={index} />;
        } else if (
          token.endsWith("\n") ||
          token.endsWith("<0x0A>") ||
          token.endsWith("<newline>")
        ) {
          const parts = token.split("\n");
          return parts.map((part, i) => (
            <React.Fragment key={index + i}>
              {i > 0 && <br />}
              <span
                style={{
                  backgroundColor: pastelColors[index % pastelColors.length],
                  padding: "0 0px",
                  borderRadius: "3px",
                  marginRight: "2px",
                  marginBottom: "5px",
                  display: "inline-block",
                  height: "1.5em",
                  whiteSpace: "pre-wrap",
                }}
              >
                {part}
              </span>
            </React.Fragment>
          ));
        } else {
          return (
            <span
              key={index}
              style={{
                backgroundColor: pastelColors[index % pastelColors.length],
                padding: "0 0px",
                borderRadius: "3px",
                marginRight: "2px",
                marginBottom: "5px",
                display: "inline-block",
                height: "1.5em",
                whiteSpace: "pre-wrap",
              }}
            >
              {token}
            </span>
          );
        }
      })}
    </div>
  );
};

const EncodedTokens = ({ tokens }) => (
  <div
    className="token_div"
    style={{ minWidth: "200px", fontFamily: "monospace" }}
  >
    {"[\n  "}
    {tokens?.map((token, index) => (
      <React.Fragment key={index}>
        {index !== 0 && ", "}
        {token}
        {index !== tokens.length - 1 && (index + 1) % 10 === 0 ? ",\n  " : null}
      </React.Fragment>
    ))}
    {"\n]"}
  </div>
);

const App = () => {
  const [inputText, setInputText] = useState(
    "Welcome to tokenizer. Replace this with your text to see how tokenization works."
  );
  const [displayTokens, setDisplayTokens] = useState(false);
  const [selectedEncoding, setSelectedEncoding] = useState("llamaTokenizer");

  const handleChange = (event) => {
    setSelectedEncoding(event.target.value);
  };

  let api = tokenizers[selectedEncoding];
  let encodedTokens;
  let decoded;
  if (selectedEncoding === "MistralTokenizer") {
    api = new MistralTokenizer();
    encodedTokens = api.encode(inputText);
    var MistralTokenizerDecodedTokens = encodedTokens.map((token) => {
      const chars = api.decode([token], false, false);
      if (token === 0) return "<unk>";
      if (token === 1) return "<s>";
      if (token === 2) return "</s>";
      if (token === 13) return "<newline>";
      if (token >= 3 && token <= 258) return api.vocabById[token];
      return chars;
    });
  } else if (selectedEncoding === "llamaTokenizer") {
    encodedTokens = api.encode(inputText);
    decoded = api.decode(encodedTokens);
    var llamaTokenizerDecodedTokens = encodedTokens.map((token) => {
      const chars = api.decode([token], false, false);
      if (token === 0) return "<unk>";
      if (token === 1) return "<s>";
      if (token === 2) return "</s>";
      if (token >= 3 && token <= 258) return api.vocabById[token];
      return chars;
    });
  } else {
    encodedTokens = api.encode(inputText);
    decoded = api.decode(encodedTokens);
    var gptokenizerDecodedTokens = [];
    for (const token of api.decodeGenerator(encodedTokens)) {
      gptokenizerDecodedTokens.push(token);
    }
  }

  const toggleDisplay = () => {
    setDisplayTokens(!displayTokens);
  };

  const selectEncoding = (
    <div className="selector_div">
      <label htmlFor="encoding-select">Encoder:</label>&nbsp;
      <select
        id="encoding-select"
        value={selectedEncoding}
        onChange={handleChange}
      >
        <option value="llamaTokenizer">llamaTokenizer</option>
        <option value="MistralTokenizer">MistralTokenizer</option>
        <option value="cl100k_base">cl100k_base (GPT-3.5-turbo and GPT-4)</option>
      </select>
    </div>
  );

  return (
    <>
      <div className="container">
        <h2 className="heading">Tokenizer</h2>
        <br />
        {selectEncoding}
        <div className="tokenizer">
          <TextInput
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button onClick={() => setInputText("")}>Clear</button>
        </div>
        <div>
          {displayTokens ? (
            <EncodedTokens tokens={encodedTokens} />
          ) : selectedEncoding === "MistralTokenizer" ? (
            <TokenizedText tokens={MistralTokenizerDecodedTokens} />
          ) : selectedEncoding === "llamaTokenizer" ? (
            <TokenizedText tokens={llamaTokenizerDecodedTokens} />
          ) : (
            <TokenizedText tokens={gptokenizerDecodedTokens} />
          )}
        </div>
        <button onClick={toggleDisplay}>
          {displayTokens ? "Show tokenized text" : "Show Token IDs"}
        </button>
        <div className="statistics">
          <div>
            Characters <br /> <span>{inputText.length}</span>
          </div>
          <div>
            Tokens <br /> <span>{encodedTokens.length}</span>{" "}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "right",
          }}
        ></div>
      </div>
    </>
  );
};

export default App;
