import { assert } from 'chai';
import UtilityService from './utility';
import Region from '@chrisjsherm/region';
const config = require('../config.sample');

describe('Utility service', () => {
  const utilityService = new UtilityService(config);

  // addRegionProperty.
  it('should add a region property to each vendor with a matching region', () => {
    const vendorMap = new Map();
    vendorMap.set('1111', {
      zip: '24068',
    });
    vendorMap.set('2222', {
      zip: '22152',
    });

    const regions = [
      new Region(
        'New River Valley',
        new Set([
          '24068',
          '24073',
          '24061',
          '24060',
          '24141',
          '24142',
          '24143',
        ]),
      ),
      new Region(
        'Roanoke Valley',
        new Set([
          '24011',
          '24012',
          '24013',
          '24014',
          '24015',
          '24016',
          '24017',
          '24018',
          '24019',
        ]),
      ),
    ];

    assert.deepStrictEqual(
      utilityService.addRegionProperty(vendorMap, regions).get('1111'),
      {
        zip: '24068',
        region: 'New River Valley',
      },
    );

    assert.deepStrictEqual(
      utilityService.addRegionProperty(vendorMap, regions).get('2222'),
      {
        zip: '22152',
      },
    );
  });

  // appendSupplierTypeInformation.
  it('should insert the supplier type information for each vendor', () => {
    const vendors = [
      {
        nigpCodes: '24500|25000|23000',
        naicsCodes: '9800|4500',
      },
      {
        nigpCodes: '24500',
      },
    ];

    const nigpCodes = {
      '24500': {
        description: 'Wood chucking',
      },
      '25000': {
        description: 'Tree felling',
      },
    };

    const naicsCodes = {
      '9800': {
        description: "Dump truckin'",
      },
      '4500': {
        description: "Long haulin'",
      },
    };

    assert.deepStrictEqual(
      utilityService.appendSupplierTypeInformation(
        vendors,
        nigpCodes,
        naicsCodes,
      ),
      [
        {
          nigpCodes: '24500|25000|23000',
          naicsCodes: '9800|4500',
          nigpCode: [
            {
              id: '24500',
              description: 'Wood chucking',
            },
            {
              id: '25000',
              description: 'Tree felling',
            },
          ],
          naicsCode: [
            {
              id: '9800',
              description: "Dump truckin'",
            },
            {
              id: '4500',
              description: "Long haulin'",
            },
          ],
        },
        {
          nigpCodes: '24500',
          nigpCode: [
            {
              id: '24500',
              description: 'Wood chucking',
            },
          ],
        },
      ],
    );
  });

  // convertPropertiesToBoolean.
  it('should convert each property to a boolean value.', () => {
    assert.deepStrictEqual(
      utilityService.convertPropertiesToBoolean(
        {
          name: 'Zobel',
          professor: 'Emeritus',
        },
        ['professor'],
      ),
      {
        name: 'Zobel',
        professor: true,
      },
    );
  });

  // generateClassificationCodesObject.
  it(
    'should generate an object with keys representing each classification code ' +
      'and an object value with a "description" property.',
    () => {
      const classificationCodesArr = [
        {
          code: '00505',
          description: 'Abrasive equip and tools',
        },
        {
          code: '00514',
          description: 'Abr Coat Cloth/Fiber/Sandpap',
        },
      ];

      const codes = utilityService.generateClassificationCodesObject(
        classificationCodesArr,
      );

      assert.deepStrictEqual(codes, {
        '00505': {
          description: 'Abrasive equip and tools',
        },
        '00514': {
          description: 'Abr Coat Cloth/Fiber/Sandpap',
        },
      });
    },
  );

  // initializeSuppliers.
  it('should intialize vendors and filter out those without certifications', () => {
    const vendors = [
      {
        womanOwnedStartDate: '06-02-2020',
        certificationNumber: '110200',
        [config.uniqueVendorIdProperty]: null,
      },
      {
        microStartDate: '06-02-2020',
        certificationNumber: '110233',
        [config.uniqueVendorIdProperty]: '90545323',
      },
      {
        dbeStartDate: '06-02-2020',
        certificationNumber: '120233',
        [config.uniqueVendorIdProperty]: null,
      },
      {
        womanOwnedStartDate: '06-02-2020',
        smallStartDate: '02-01-2021',
        minorityOwnedStartDate: '01-01-2000',
        microStartDate: '06-02-2020',
        certificationNumber: '110201',
        [config.uniqueVendorIdProperty]: null,
      },
    ];

    const initializedVendorMap = utilityService.initializeSuppliers(vendors);

    // Ensure the properties are correctly set.
    assert.deepStrictEqual(
      initializedVendorMap.get(vendors[0].certificationNumber),
      {
        womanOwnedStartDate: true,
        microStartDate: false,
        minorityOwnedStartDate: false,
        smallStartDate: false,
        certificationNumber: '110200',
        [config.uniqueVendorIdProperty]: false,
        certifications: ['womanOwned'],
      },
    );
    assert.deepStrictEqual(
      initializedVendorMap.get(vendors[1].certificationNumber),
      {
        womanOwnedStartDate: false,
        microStartDate: true,
        minorityOwnedStartDate: false,
        smallStartDate: false,
        certificationNumber: '110233',
        [config.uniqueVendorIdProperty]: true,
        certifications: ['micro'],
      },
    );
    assert.deepStrictEqual(
      initializedVendorMap.get(vendors[3].certificationNumber),
      {
        womanOwnedStartDate: true,
        microStartDate: true,
        minorityOwnedStartDate: true,
        smallStartDate: true,
        certificationNumber: '110201',
        [config.uniqueVendorIdProperty]: false,
        certifications: ['micro', 'minorityOwned', 'small', 'womanOwned'],
      },
    );

    // Ensure vendors without the certifications we're interested in are
    // not included.
    assert.deepStrictEqual(
      initializedVendorMap.has(vendors[2].certificationNumber),
      false,
    );
    assert.strictEqual(initializedVendorMap.size, 3);
  });
});
