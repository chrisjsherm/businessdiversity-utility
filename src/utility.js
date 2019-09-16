'use strict';
const Region = require('@chrisjsherm/region');

class Utility {
  /**
   * Config object matching the object shape of the ./config.sample.js file.
   *
   * @param {Object} config
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * Add a Region object to the suppliers in that region.
   *
   * @param {Map} vendorMap Map of vendor objects with certification number keys.
   * @param {Array<Region>} regions Array of region objects
   *
   * @returns {Map} Map of vendor objects with a region property, where applicable.
   *
   * @throws {TypeError} vendorMap must be of type Map and regions must be an
   *  Array of Regions.
   * @throws {RangeError} Zip code entries must be strings of length five.
   */
  addRegionProperty(vendorMap, regions) {
    if (!(vendorMap instanceof Map)) {
      throw new TypeError('Parameter vendorMap must be of type Map.');
    }

    const regionsErrorMessage =
      'Parameter regions must be an Array of ' +
      `Regions. Invalid value: ${JSON.stringify(regions)}.`;
    if (!Array.isArray(regions)) {
      throw new TypeError(regionsErrorMessage);
    }

    regions.forEach(region => {
      if (!(region instanceof Region)) {
        throw new TypeError(regionsErrorMessage);
      }
    });

    for (const vendor of vendorMap.values()) {
      for (const region of regions) {
        if (region.zipCodes.has(vendor.zip)) {
          vendor.region = region.name;
          break;
        }
      }
    }

    return vendorMap;
  }

  /**
   * Add the supplier type information to each vendor.
   *
   * @param vendors {Array} Array of vendor objects.
   * @param nigpCodes {Object} Keys are NIGP codes with associated
   *  metadata values.
   * @param naicsCodes {Object} Keys are NAICS codes with associated
   *  metadata values.
   *
   * @returns {Array} Array of vendor objects.
   */
  appendSupplierTypeInformation(vendors, nigpCodes, naicsCodes) {
    for (const dataObj of vendors) {
      // Add NIGP information.
      if (dataObj.hasOwnProperty('nigpCodes')) {
        const vendorCodes = dataObj.nigpCodes.split('|');
        if (!Array.isArray(dataObj[this.config.nigpCodesProperty])) {
          dataObj[this.config.nigpCodesProperty] = [];
        }
        for (const code of vendorCodes) {
          if (nigpCodes[code]) {
            const supplierEntry = {
              id: code,
              description: nigpCodes[code].description,
            };

            dataObj[this.config.nigpCodesProperty].push(supplierEntry);
          }
        }
      }

      // TODO: Clean up duplication.
      // Add NAICS information.
      if (dataObj.hasOwnProperty('naicsCodes')) {
        const vendorCodes = dataObj.naicsCodes.split('|');
        if (!Array.isArray(dataObj[this.config.naicsCodesProperty])) {
          dataObj[this.config.naicsCodesProperty] = [];
        }
        for (const code of vendorCodes) {
          if (naicsCodes[code]) {
            const supplierEntry = {
              id: code,
              description: naicsCodes[code].description,
            };

            dataObj[this.config.naicsCodesProperty].push(supplierEntry);
          }
        }
      }
    }

    return vendors;
  }

  /**
   * For a given object, convert the supplied properties to boolean values.
   *
   * @param {Object} obj Object on which to convert properties.
   * @param {string[]} properties List of properties to convert to boolean values.
   *
   * @returns {Object} Memory reference to original object with converted properties.
   *
   * @throws {TypeError} If obj is not an Object or properties is not an Array of strings.
   */
  convertPropertiesToBoolean(obj, properties) {
    if (typeof obj !== 'object' || obj === null) {
      throw new TypeError(
        `Parameter 'obj' must be of type Object. Invalid value: ${JSON.stringify(
          obj
        )}`
      );
    }

    if (!Array.isArray(properties)) {
      throw new TypeError(
        `Parameter 'properties' must be an Array of strings. Invalid value: ${JSON.stringify(
          properties
        )}`
      );
    }

    for (let prop of properties) {
      if (typeof prop !== 'string') {
        throw new TypeError(
          `Each property must be a string. Invalid value: ${JSON.stringify(
            prop
          )}`
        );
      }
      obj[prop] = !!obj[prop];
    }

    return obj;
  }

  /**
   * Generate an object with keys representing each classification code. Each
   * object has a "description" property with a string defining the code.
   *
   * @param {Array<Object>} classificationCodesArr
   *
   * @returns {Object} Keys are classification codes and each key contains an
   *  object with a "description" property.
   *
   * @throws {TypeError} If classificationCodesArr is not an Array.
   */
  generateClassificationCodesObject(classificationCodesArr) {
    if (!Array.isArray(classificationCodesArr)) {
      throw new TypeError(
        'Parameter classificationCodesArr must be of type Array. ' +
          `Invalid value: ${JSON.stringify(classificationCodesArr)}`
      );
    }

    const classificationCodesObj = {};
    for (const classification of classificationCodesArr) {
      classificationCodesObj[classification.code] = {
        description: classification.description,
      };
    }

    return classificationCodesObj;
  }

  /**
   * Initialize each vendor object with properties not represented by the CSV file.
   *
   * @param {Object[]} vendorArr Vendors to be initialized.
   *
   * @returns {Map<string, object>} Map of vendors by certification number.
   */
  initializeSuppliers(vendorArr) {
    const that = this;
    const vendorMap = new Map();
    const certificationProperties = [
      this.config.isCertifiedMicroProperty,
      this.config.isCertifiedMinorityProperty,
      this.config.isCertifiedSmallProperty,
      this.config.isCertifiedWomanProperty,
    ];

    vendorArr.forEach(dataObj => {
      that.convertPropertiesToBoolean(dataObj, [
        that.config.uniqueVendorIdProperty,
        ...certificationProperties,
      ]);

      // Determine the vendor's certifications.
      const certifications = [];
      for (const key of certificationProperties) {
        if (dataObj[key]) {
          certifications.push(
            // Remove 'StartDate' from the certification key name.
            key.replace('StartDate', '')
          );
        }
      }
      dataObj.certifications = certifications;

      // Vendor must have at least one certification.
      if (certifications.length) {
        vendorMap.set(
          dataObj[this.config.certificationNumberProperty],
          dataObj
        );
      }
    });

    that.addRegionProperty(vendorMap, this.config.regions);

    return vendorMap;
  }
}

module.exports = Utility;
