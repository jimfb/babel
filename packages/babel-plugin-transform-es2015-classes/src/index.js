import LooseTransformer from "./loose";
import VanillaTransformer from "./vanilla";
import nameFunction from "babel-helper-function-name";

export default function ({ types: t }) {
  return {
    visitor: {
      ClassDeclaration(path) {
        let { node } = path;

        let ref = node.id || path.scope.generateUidIdentifier("class");

        if (path.parentPath.isExportDefaultDeclaration()) {
          path = path.parentPath;
          path.insertAfter(t.exportDefaultDeclaration(ref));
        }

        path.replaceWith(t.variableDeclaration("let", [
          t.variableDeclarator(ref, t.toExpression(node))
        ]));
      },

      ClassExpression(path, state) {
        let inferred = nameFunction(path);
        if (inferred && inferred !== path.node) return path.replaceWith(inferred);

        let Constructor = VanillaTransformer;
        if (state.opts.loose) Constructor = LooseTransformer;

        path.replaceWith(new Constructor(path, state.file).run());
      }
    }
  };
}
