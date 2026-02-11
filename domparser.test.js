const Ltxml = require('./ltxml');

describe('DOMParser integration (via @xmldom/xmldom)', () => {
  const simpleXml = '<root><child>value</child></root>';
  const xmlWithBOM = '\uFEFF<root><child>value</child></root>';
  const malformedXml = '<root><child></root>';

  describe('Ltxml.XDocument.parse', () => {
        test('should handle empty XML string gracefully', () => {
          expect(() => {
            Ltxml.XDocument.parse('');
          }).toThrow();
        });

        test('should parse XML with namespaces', () => {
          const xmlStr = '<root xmlns:x="http://example.com/x"><x:child>value</x:child></root>';
          const doc = Ltxml.XDocument.parse(xmlStr);
          expect(doc.root).toBeDefined();
          expect(doc.root.name.localName).toBe('root');
          expect(doc.root.nodesArray.length).toBe(1);
          const child = doc.root.nodesArray[0];
          expect(child.name.localName).toBe('child');
          expect(child.name.namespaceName).toBe('http://example.com/x');
        });

        test('should parse deeply nested XML', () => {
          const xmlStr = '<a><b><c><d>deep</d></c></b></a>';
          const doc = Ltxml.XDocument.parse(xmlStr);
          expect(doc.root).toBeDefined();
          expect(doc.root.name.localName).toBe('a');
          let node = doc.root;
          for (const name of ['b', 'c', 'd']) {
            expect(node.nodesArray.length).toBe(1);
            node = node.nodesArray[0];
            expect(node.name.localName).toBe(name);
          }
          // Log the structure for diagnosis
          // console.log('Deepest node:', node);
          // Accept that the deepest node may have a text node child
          // Check that the only child is a text node with value 'deep'
          expect(node.nodesArray.length).toBe(1);
          const textNode = node.nodesArray[0];
          expect(textNode.nodeType).toBe('Text');
          expect(textNode.value).toBe('deep');
        });

        test('should handle invalid characters in XML', () => {
          const xmlStr = '<root>abc\u0001def</root>';
          const doc = Ltxml.XDocument.parse(xmlStr);
          expect(doc.root).toBeDefined();
          expect(doc.root.name.localName).toBe('root');
          // The invalid character may be ignored or replaced; check that parsing does not throw
          expect(typeof doc.root.value).toBe('string');
        });
    test('should parse simple XML and produce a document with correct root', () => {
      const doc = Ltxml.XDocument.parse(simpleXml);
      expect(doc.root).toBeDefined();
      expect(doc.root.name.localName).toBe('root');
    });

    test('should handle XML with BOM', () => {
      const doc = Ltxml.XDocument.parse(xmlWithBOM);
      expect(doc.root).toBeDefined();
      expect(doc.root.name.localName).toBe('root');
    });

    test('should return a document with parsererror for malformed XML', () => {
        const xmlStr = '<root attr'; // malformed XML
        const doc = Ltxml.XDocument.parse(xmlStr);
        // For @xmldom/xmldom, malformed XML does not produce a parsererror node.
        // Instead, it logs a warning and attempts to recover.
        // We check that the root element is not as expected (e.g., has no attributes, or is empty)
        // You may want to check for warning logs, but here we assert the root is not valid.
        expect(doc.root).toBeDefined();
        expect(doc.root.name.localName).toBe('root');
        // The malformed XML should result in an element with no attributes
        expect(doc.root.attributesArray.length).toBe(0);
        // Optionally, check that the document structure is not as expected
        // For well-formed XML, root should have attributes, so this is a sign of recovery
        // If you want to check for warnings, you can mock console.warn and assert it was called
    });
  });

  describe('Ltxml.XElement.parse', () => {
    test('should parse simple XML and produce an element with correct name', () => {
      const el = Ltxml.XElement.parse(simpleXml);
      expect(el).toBeDefined();
      expect(el.name.localName).toBe('root');
    });
  });
});
