/**
 * Node Script: CSV to JSON and back.
 * ------------------------------------------------------------------------------
 * A boilerplate for parsing and modifying CSV data.
 *
 * - Parses a CSV file that you input
 * - Modifies the CSV to a JSON object
 * - You run ES6 functions to modify data
 * - Output modified object to a new CSV file
 *
 * Modify to suit your needs.
 */

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');
const fs = require('fs');

const inputCsvJson = [];
let modifiedCsvJson = [];

/**
 * Global config.
 */
const config = {
  inputFile: './input/input-file.csv',
  outputFile: './output/eBay-Report.csv',
};

/**
 * CSV configuration - more found in csvWriter docs.
 *
 * id: Title of the column from the input CSV
 * title: title of column in output, where input data will be mapped to.
 *
 * Each header ID needs to match the CSV header title text and can be reordered.
 */
const csvWriter = createCsvWriter({
  path: config.outputFile,
  header: [
    {
      id: 'Ship To Phone',
      title: 'Phone'
    },
    {
      id: 'Buyer Name',
      title: 'First Name'
    },
    {
      id: '',
      title: 'Last Name'
    },
    {
      id: '',
      title: 'Email'
    },
    {
      id: 'Item Title',
      title: 'Address'
    },
    {
      id: '',
      title: 'City'
    },
    {
      id: '',
      title: 'State'
    },
    {
      id: '',
      title: 'Zip'
    },
    {
      id: '',
      title: 'Company Name'
    },
    {
      id: '',
      title: 'Tags'
    },
  ],
  alwaysQuote: true,
});

/**
 * Initialise script.
 */
function init() {
  console.log('Initiating...');
  console.log(`Preparing to parse CSV file... ${config.inputFile}`);

  fs.createReadStream(config.inputFile)
    .pipe(csv())
    .on('data', (data) => inputCsvJson.push(data))
    .on('end', () => {
      modifiedCsvJson = inputCsvJson

      console.log('...Done');

      initFunctions();
    });
}

/**
 * Execute functions once data is available.
 */
function initFunctions() {
  console.log('Initiating script functionality...');

  modifyDescription();
  modifyNames();
  filterCountry();

  /**
   * Once everything is finished, write to file.
   */
  writeDataToFile();
}

/**
 * Function that will remove items that don't match our desired country.
 */
function filterCountry() {
  console.log('Removing items shipped to different countries');

  modifiedCsvJson = modifiedCsvJson.filter((item) => {
    
    return item['Ship To Country'] !== 'United States' ? false : item
  });


  console.log('...Done');
}

/**
 * Removes the parenthesis from the 'Certified Units' field.
 */
function modifyDescription() {
  console.log('Removing extra letters in description...')
  modifiedCsvJson = modifiedCsvJson.map((item) => {
    const returnedItem = item
    const itemKey = 'Item Title'

    returnedItem[itemKey] = item[itemKey].substr(0, 23);

    return returnedItem
  })

  console.log('...Done');
}

function modifyNames() {
  console.log('Removing last name and duplicates...')

  const uniqueNames = new Set();

  modifiedCsvJson = modifiedCsvJson.map((item) => {
    const returnedItem = item
    const itemKey = 'Buyer Name';
    const fullName = item[itemKey];

    // Check for duplicates
    if (!uniqueNames.has(fullName)) {
      uniqueNames.add(fullName);

      // Remove last name
      const modifiedName = fullName.split(' ').slice(0, -1).join(' ');
      returnedItem[itemKey] = modifiedName;
    } else {
      returnedItem[itemKey] = null;
    }

    return returnedItem;
  })

  console.log('...Done');
}


/**
 * Write all modified data to its own CSV file.
 */
function writeDataToFile() {
  console.log(`Writing data to a file...`);

  csvWriter.writeRecords(modifiedCsvJson)
    .then(() => {
      console.log('The CSV file was written successfully!')

      console.log('...Finished!');
    });
}

init();
