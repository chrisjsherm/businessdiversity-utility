'use strict';
const Region = require('@chrisjsherm/region');

module.exports = {
  uniqueVendorIdProperty: 'vendorId',
  certificationNumberProperty: 'certificationNumber',
  isCertifiedACDBEProperty: 'acdbeStartDate',
  isCertifiedDBEProperty: 'dbeStartDate',
  isCertifiedESOProperty: 'esoStartDate',
  isCertifiedMicroProperty: 'microStartDate',
  isCertifiedMinorityProperty: 'minorityOwnedStartDate',
  isCertifiedServiceProperty: 'serviceDisabledVeteranStartDate',
  isCertifiedSmallProperty: 'smallStartDate',
  isCertifiedWomanProperty: 'womanOwnedStartDate',
  naicsCodesProperty: 'naicsCode',
  naicsDescriptionProperty: 'naicsDescription',
  nigpCodesProperty: 'nigpCode',
  nigpDescriptionProperty: 'nigpDescription',
  nodeEnvironmentProduction: 'production',
  regions: [
    new Region(
      'New River Valley',
      new Set(['24068', '24073', '24061', '24060', '24141', '24142', '24143']),
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
  ],
};
