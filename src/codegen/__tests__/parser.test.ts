import {parser} from '../../codegen/parser';

test('run', () => {
  expect(parser('blah.ts')).toMatchInlineSnapshot(`
    Object {
      "description": null,
      "mutation": Object {
        "__type": "Object",
        "description": null,
        "fields": Array [
          Object {
            "__type": "Field",
            "args": Array [
              Object {
                "__type": "Arg",
                "description": null,
                "name": "name",
                "type": Object {
                  "__type": "NonNull",
                  "type": "String",
                },
              },
              Object {
                "__type": "Arg",
                "description": null,
                "name": "age",
                "type": "Float",
              },
              Object {
                "__type": "Arg",
                "description": null,
                "name": "externalName",
                "type": Object {
                  "__type": "NonNull",
                  "type": "Int",
                },
              },
              Object {
                "__type": "Arg",
                "description": null,
                "name": "another",
                "type": "String",
              },
            ],
            "description": null,
            "name": "create_location",
            "resolution": Object {
              "__type": "RootResolution",
              "export": "Location",
              "file": "./src/codegen/sample/blah",
              "method": "blahBlahCreateLocation",
            },
            "type": Object {
              "__type": "NonNull",
              "type": "Location",
            },
          },
          Object {
            "__type": "Field",
            "args": Array [
              Object {
                "__type": "Arg",
                "description": null,
                "name": "input",
                "type": Object {
                  "__type": "NonNull",
                  "type": "Foo",
                },
              },
            ],
            "description": null,
            "name": "edit_location",
            "resolution": Object {
              "__type": "RootResolution",
              "export": "Location",
              "file": "./src/codegen/sample/blah",
              "method": "blahEditItYeah",
            },
            "type": Object {
              "__type": "NonNull",
              "type": "Location",
            },
          },
        ],
        "interfaces": Array [],
        "name": "Mutation",
      },
      "query": Object {
        "__type": "Object",
        "description": null,
        "fields": Array [
          Object {
            "__type": "Field",
            "args": Array [],
            "description": null,
            "name": "location",
            "resolution": Object {
              "__type": "RootResolution",
              "export": "Location",
              "file": "./src/codegen/sample/blah",
              "method": "loadLoc",
            },
            "type": Object {
              "__type": "NonNull",
              "type": "Location",
            },
          },
          Object {
            "__type": "Field",
            "args": Array [],
            "description": null,
            "name": "locations",
            "resolution": Object {
              "__type": "RootResolution",
              "export": "Location",
              "file": "./src/codegen/sample/blah",
              "method": "loadAllLocations",
            },
            "type": Object {
              "__type": "NonNull",
              "type": Object {
                "__type": "List",
                "items": Object {
                  "__type": "NonNull",
                  "type": "Location",
                },
              },
            },
          },
          Object {
            "__type": "Field",
            "args": Array [],
            "description": null,
            "name": "locationStrings",
            "resolution": Object {
              "__type": "RootResolution",
              "export": "Location",
              "file": "./src/codegen/sample/blah",
              "method": "someStrings",
            },
            "type": Object {
              "__type": "List",
              "items": Object {
                "__type": "NonNull",
                "type": "String",
              },
            },
          },
          Object {
            "__type": "Field",
            "args": Array [],
            "description": null,
            "name": "aString",
            "resolution": Object {
              "__type": "RootResolution",
              "export": "Location",
              "file": "./src/codegen/sample/blah",
              "method": "aString",
            },
            "type": Object {
              "__type": "NonNull",
              "type": "String",
            },
          },
          Object {
            "__type": "Field",
            "args": Array [],
            "description": null,
            "name": "anIntYeah",
            "resolution": Object {
              "__type": "RootResolution",
              "export": "Location",
              "file": "./src/codegen/sample/blah",
              "method": "anInt",
            },
            "type": Object {
              "__type": "NonNull",
              "type": "Int",
            },
          },
        ],
        "interfaces": Array [],
        "name": "Query",
      },
      "structures": Object {
        "Boolean": Object {
          "__type": "Scalar",
          "description": null,
          "name": "Boolean",
        },
        "Date": Object {
          "__type": "Scalar",
          "description": null,
          "name": "Date",
        },
        "Float": Object {
          "__type": "Scalar",
          "description": null,
          "name": "Float",
        },
        "Foo": Object {
          "__type": "InputObject",
          "description": null,
          "fields": Array [
            Object {
              "__type": "InputField",
              "description": null,
              "name": "blah",
              "type": "Int",
            },
          ],
          "name": "Foo",
        },
        "ID": Object {
          "__type": "Scalar",
          "description": null,
          "name": "ID",
        },
        "Int": Object {
          "__type": "Scalar",
          "description": null,
          "name": "Int",
        },
        "Location": Object {
          "__type": "Object",
          "description": null,
          "fields": Array [
            Object {
              "__type": "Field",
              "args": Array [],
              "description": null,
              "name": "aNumber3",
              "resolution": Object {
                "__type": "FromParentResolution",
                "method": "aNumbex3",
              },
              "type": "Int",
            },
            Object {
              "__type": "Field",
              "args": Array [],
              "description": null,
              "name": "getNotes",
              "resolution": Object {
                "__type": "FromParentResolution",
                "method": "getNotes",
              },
              "type": "String",
            },
            Object {
              "__type": "Field",
              "args": Array [],
              "description": null,
              "name": "genNotes",
              "resolution": Object {
                "__type": "FromParentResolution",
                "method": "genNotes",
              },
              "type": Object {
                "__type": "NonNull",
                "type": "String",
              },
            },
            Object {
              "__type": "Field",
              "args": Array [
                Object {
                  "__type": "Arg",
                  "description": null,
                  "name": "foo",
                  "type": Object {
                    "__type": "NonNull",
                    "type": "Int",
                  },
                },
              ],
              "description": null,
              "name": "genNotesMaybePromise",
              "resolution": Object {
                "__type": "FromParentResolution",
                "method": "genNotesMaybePromise",
              },
              "type": "String",
            },
            Object {
              "__type": "Field",
              "args": Array [],
              "description": null,
              "name": "genNotesNullablePromise",
              "resolution": Object {
                "__type": "FromParentResolution",
                "method": "genNotesNullablePromise",
              },
              "type": "String",
            },
            Object {
              "__type": "Field",
              "args": Array [],
              "description": null,
              "name": "genNotesMaybeNullablePromise",
              "resolution": Object {
                "__type": "FromParentResolution",
                "method": "genNotesMaybeNullablePromise",
              },
              "type": "String",
            },
            Object {
              "__type": "Field",
              "args": Array [],
              "description": null,
              "name": "custom_field_name",
              "resolution": Object {
                "__type": "FromParentResolution",
                "method": "genMethodWithCustomFieldName",
              },
              "type": Object {
                "__type": "NonNull",
                "type": "Float",
              },
            },
            Object {
              "__type": "Field",
              "args": Array [],
              "description": null,
              "name": "differentFieldName",
              "type": Object {
                "__type": "NonNull",
                "type": "String",
              },
            },
            Object {
              "__type": "Field",
              "args": Array [],
              "description": null,
              "name": "name",
              "type": Object {
                "__type": "NonNull",
                "type": "String",
              },
            },
            Object {
              "__type": "Field",
              "args": Array [],
              "description": null,
              "name": "name4",
              "type": "String",
            },
            Object {
              "__type": "Field",
              "args": Array [],
              "description": null,
              "name": "aNumber",
              "type": Object {
                "__type": "NonNull",
                "type": "Int",
              },
            },
            Object {
              "__type": "Field",
              "args": Array [],
              "description": null,
              "name": "aNumber2",
              "type": "Int",
            },
          ],
          "interfaces": Array [],
          "name": "Location",
        },
        "String": Object {
          "__type": "Scalar",
          "description": null,
          "name": "String",
        },
      },
      "subscription": null,
    }
  `);
});
