import { getAllTypes, findMapping } from '../src/map';
import { TerraformMapper } from '../src';

// we automatically generate a jest test for each "test" in the mapping definitions
// the test simply passes the `cfn` input to `mapper.toTerraformProps()` and expects
// to receive the value in the `tf` field.

jest.setTimeout(10 * 60 * 1000); // 10min

for (const cfnType of getAllTypes()) {

  describe(cfnType, () => {

    const mapping = findMapping(cfnType);
    const mapper = new TerraformMapper(cfnType);
    
    test('is registered as a type', () => {
      expect(mapping).toBeDefined();
      expect(mapper).toBeDefined();
    });

    test('resource types', () => {
      expect(mapper.cfnResourceType).toBe(cfnType);
      expect(mapper.terraformResourceType).toBe(mapping.type);
    });

    for (const [prop, value] of Object.entries(mapping.properties ?? {})) {
      describe(prop, () => {
        test('has at least one test in the "tests" section', () => {
          // we expect at least one test
          expect(value.tests.length).toBeGreaterThan(0);
        });

        for (const t of value.tests ?? []) {
          test(`toTerraformProps(${JSON.stringify(t.cfn)}) returns ${JSON.stringify(t.tf)}`, () => {
            expect(mapper.toTerraformProps(t.cfn)).toStrictEqual(t.tf);
          });

          // TODO: if the input is an object, inject some random keys and ensure the mapper fails.
          // this verifies that the mapper is explicit about property handling.
        }
      });
    }
  });
}
