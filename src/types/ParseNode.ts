// From https://github.com/KaTeX/KaTeX/blob/master/src/Token.js
interface LexerInterface {
  input: string;
  tokenRegex: RegExp;
}

// From https://github.com/KaTeX/KaTeX/blob/master/src/SourceLocation.js
interface SourceLocation {
  lexer: LexerInterface; // Lexer holding the input string.
  start: number; // Start offset, zero-based inclusive.
  end: number; // End offset, zero-based exclusive.
}

// From https://github.com/KaTeX/KaTeX/blob/master/src/types.js
type Mode = "math" | "text";
type StyleStr = "text" | "display" | "script" | "scriptscript";

// From https://github.com/KaTeX/KaTeX/blob/master/src/enivronemnts/array.js
type ColSeparationType = "align" | "alignat" | "gather" | "small" | "CD";

type AlignSpec =
  | { type: "separator"; separator: string }
  | {
      type: "align";
      align: string;
      pregap?: number;
      postgap?: number;
    };

// From https://github.com/KaTeX/KaTeX/blob/master/src/units.js
type Measurement = { number: number; unit: string };

// From https://github.com/KaTeX/KaTeX/blob/master/src/symbols.js
const ATOMS = {
  bin: 1,
  close: 1,
  inner: 1,
  open: 1,
  punct: 1,
  rel: 1,
};
type Atom = keyof typeof ATOMS;

// From https://github.com/KaTeX/KaTeX/blob/master/src/Token.js
interface Token {
  text: string;
  loc?: SourceLocation;
  noexpand?: boolean; // don't expand the token
  treatAsRelax?: boolean; // used in \noexpand
  range: (
    endToken: Token, // last token of the range, inclusive
    text: string, // the text of the newly constructed token
  ) => Token;
}

// From https://github.com/KaTeX/KaTeX/blob/master/src/parseNode.js
type ParseNode =
  | {
      type: "array";
      mode: Mode;
      loc?: SourceLocation;
      colSeparationType?: ColSeparationType;
      hskipBeforeAndAfter?: boolean;
      addJot?: boolean;
      cols?: AlignSpec[];
      arraystretch: number;
      body: ParseNode[][]; // List of rows in the (2D) array.
      rowGaps: Measurement[];
      hLinesBeforeRow: Array<boolean[]>;
      addEqnNum?: boolean;
      leqno?: boolean;
      isCD?: boolean;
    }
  | {
      type: "cdlabel";
      mode: Mode;
      loc?: SourceLocation;
      side: string;
      label: ParseNode;
    }
  | {
      type: "cdlabelparent";
      mode: Mode;
      loc?: SourceLocation;
      fragment: ParseNode;
    }
  | {
      type: "color";
      mode: Mode;
      loc?: SourceLocation;
      color: string;
      body: ParseNode[];
    }
  | {
      type: "color-token";
      mode: Mode;
      loc?: SourceLocation;
      color: string;
    }
  // To avoid requiring run-time type assertions; this more carefully captures
  // the requirements on the fields per the op.js htmlBuilder logic:
  // - `body` and `value` are NEVER set simultanouesly.
  // - When `symbol` is true; `body` is set.
  | {
      type: "op";
      mode: Mode;
      loc?: SourceLocation;
      limits: boolean;
      alwaysHandleSupSub?: boolean;
      suppressBaseShift?: boolean;
      parentIsSupSub: boolean;
      symbol: boolean;
      name: string;
      body?: void;
    }
  | {
      type: "op";
      mode: Mode;
      loc?: SourceLocation;
      limits: boolean;
      alwaysHandleSupSub?: boolean;
      suppressBaseShift?: boolean;
      parentIsSupSub: boolean;
      symbol: false; // If 'symbol' is true; `body` *must* be set.
      name?: void;
      body: ParseNode[];
    }
  | {
      type: "ordgroup";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode[];
      semisimple?: boolean;
    }
  | {
      type: "raw";
      mode: Mode;
      loc?: SourceLocation;
      string: string;
    }
  | {
      type: "size";
      mode: Mode;
      loc?: SourceLocation;
      value: Measurement;
      isBlank: boolean;
    }
  | {
      type: "styling";
      mode: Mode;
      loc?: SourceLocation;
      style: StyleStr;
      body: ParseNode[];
    }
  | {
      type: "supsub";
      mode: Mode;
      loc?: SourceLocation;
      base: ParseNode;
      sup?: ParseNode;
      sub?: ParseNode;
    }
  | {
      type: "tag";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode[];
      tag: ParseNode[];
    }
  | {
      type: "text";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode[];
      font?: string;
    }
  | {
      type: "url";
      mode: Mode;
      loc?: SourceLocation;
      url: string;
    }
  | {
      type: "verb";
      mode: Mode;
      loc?: SourceLocation;
      body: string;
      star: boolean;
    }
  // From symbol groups; constructed in Parser.js via `symbols` lookup.
  // (Some of these have "-token" suffix to distinguish them from existing
  // `ParseNode` types.)
  | {
      type: "atom";
      family: Atom;
      mode: Mode;
      loc?: SourceLocation;
      text: string;
    }
  | {
      type: "mathord";
      mode: Mode;
      loc?: SourceLocation;
      text: string;
    }
  | {
      type: "spacing";
      mode: Mode;
      loc?: SourceLocation;
      text: string;
    }
  | {
      type: "textord";
      mode: Mode;
      loc?: SourceLocation;
      text: string;
    }
  // These "-token" types don't have corresponding HTML/MathML builders.
  | {
      type: "accent-token";
      mode: Mode;
      loc?: SourceLocation;
      text: string;
    }
  | {
      type: "op-token";
      mode: Mode;
      loc?: SourceLocation;
      text: string;
    }
  // From functions.js and functions/*.js. See also "color"; "op"; "styling";
  // and "text" above.
  | {
      type: "accent";
      mode: Mode;
      loc?: SourceLocation;
      label: string;
      isStretchy?: boolean;
      isShifty?: boolean;
      base: ParseNode;
    }
  | {
      type: "accentUnder";
      mode: Mode;
      loc?: SourceLocation;
      label: string;
      isStretchy?: boolean;
      isShifty?: boolean;
      base: ParseNode;
    }
  | {
      type: "cr";
      mode: Mode;
      loc?: SourceLocation;
      newLine: boolean;
      size: Measurement;
    }
  | {
      type: "delimsizing";
      mode: Mode;
      loc?: SourceLocation;
      size: 1 | 2 | 3 | 4;
      mclass: "mopen" | "mclose" | "mrel" | "mord";
      delim: string;
    }
  | {
      type: "enclose";
      mode: Mode;
      loc?: SourceLocation;
      label: string;
      backgroundColor?: string;
      borderColor?: string;
      body: ParseNode;
    }
  | {
      type: "environment";
      mode: Mode;
      loc?: SourceLocation;
      name: string;
      nameGroup: ParseNode;
    }
  | {
      type: "font";
      mode: Mode;
      loc?: SourceLocation;
      font: string;
      body: ParseNode;
    }
  | {
      type: "genfrac";
      mode: Mode;
      loc?: SourceLocation;
      continued: boolean;
      numer: ParseNode;
      denom: ParseNode;
      hasBarLine: boolean;
      leftDelim: string;
      rightDelim: string;
      size: StyleStr | "auto";
      barSize: Measurement | null;
    }
  | {
      type: "hbox";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode[];
    }
  | {
      type: "horizBrace";
      mode: Mode;
      loc?: SourceLocation;
      label: string;
      isOver: boolean;
      base: ParseNode;
    }
  | {
      type: "href";
      mode: Mode;
      loc?: SourceLocation;
      href: string;
      body: ParseNode[];
    }
  | {
      type: "html";
      mode: Mode;
      loc?: SourceLocation;
      attributes: Record<string, string>;
      body: ParseNode[];
    }
  | {
      type: "htmlmathml";
      mode: Mode;
      loc?: SourceLocation;
      html: ParseNode[];
      mathml: ParseNode[];
    }
  | {
      type: "includegraphics";
      mode: Mode;
      loc?: SourceLocation;
      alt: string;
      width: Measurement;
      height: Measurement;
      totalheight: Measurement;
      src: string;
    }
  | {
      type: "infix";
      mode: Mode;
      loc?: SourceLocation;
      replaceWith: string;
      size?: Measurement;
      token: Token;
    }
  | {
      type: "internal";
      mode: Mode;
      loc?: SourceLocation;
    }
  | {
      type: "kern";
      mode: Mode;
      loc?: SourceLocation;
      dimension: Measurement;
    }
  | {
      type: "lap";
      mode: Mode;
      loc?: SourceLocation;
      alignment: string;
      body: ParseNode;
    }
  | {
      type: "leftright";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode[];
      left: string;
      right: string;
      rightColor: string; // undefined means "inherit"
    }
  | {
      type: "leftright-right";
      mode: Mode;
      loc?: SourceLocation;
      delim: string;
      color: string; // undefined means "inherit"
    }
  | {
      type: "mathchoice";
      mode: Mode;
      loc?: SourceLocation;
      display: ParseNode[];
      text: ParseNode[];
      script: ParseNode[];
      scriptscript: ParseNode[];
    }
  | {
      type: "middle";
      mode: Mode;
      loc?: SourceLocation;
      delim: string;
    }
  | {
      type: "mclass";
      mode: Mode;
      loc?: SourceLocation;
      mclass: string;
      body: ParseNode[];
      isCharacterBox: boolean;
    }
  | {
      type: "operatorname";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode[];
      alwaysHandleSupSub: boolean;
      limits: boolean;
      parentIsSupSub: boolean;
    }
  | {
      type: "overline";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode;
    }
  | {
      type: "phantom";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode[];
    }
  | {
      type: "hphantom";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode;
    }
  | {
      type: "vphantom";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode;
    }
  | {
      type: "raisebox";
      mode: Mode;
      loc?: SourceLocation;
      dy: Measurement;
      body: ParseNode;
    }
  | {
      type: "rule";
      mode: Mode;
      loc?: SourceLocation;
      shift: Measurement;
      width: Measurement;
      height: Measurement;
    }
  | {
      type: "sizing";
      mode: Mode;
      loc?: SourceLocation;
      size: number;
      body: ParseNode[];
    }
  | {
      type: "smash";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode;
      smashHeight: boolean;
      smashDepth: boolean;
    }
  | {
      type: "sqrt";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode;
      index: ParseNode;
    }
  | {
      type: "underline";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode;
    }
  | {
      type: "vcenter";
      mode: Mode;
      loc?: SourceLocation;
      body: ParseNode;
    }
  | {
      type: "xArrow";
      mode: Mode;
      loc?: SourceLocation;
      label: string;
      body: ParseNode;
      below: ParseNode;
    };

export default ParseNode;
