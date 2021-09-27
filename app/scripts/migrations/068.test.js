import migration68 from './068';

describe('migration #68', () => {
  it('should update the version metadata', async () => {
    const oldStorage = {
      meta: {
        version: 67,
      },
      data: {},
    };

    const newStorage = await migration68.migrate(oldStorage);
    expect(newStorage.meta).toStrictEqual({
      version: 68,
    });
  });

  it('should migrate all data', async () => {
    const oldStorage = {
      meta: {
        version: 67,
      },
      data: getOldState(),
    };

    const newStorage = await migration68.migrate(oldStorage);
    expect(newStorage).toMatchObject({
      meta: {
        version: 68,
      },
      data: {
        FooController: { a: 'b' },
        PermissionController: { subjects: expect.any(Object) },
        PermissionLogController: {
          permissionActivityLog: expect.any(Object),
          permissionHistory: expect.any(Object),
        },
        SubjectMetadataController: { subjectMetadata: expect.any(Object) },
      },
    });
    expect(newStorage.PermissionsController).toBeUndefined();
    expect(newStorage.PermissionsMetadata).toBeUndefined();
  });

  it('should migrate the PermissionsController state', async () => {
    const oldStorage = {
      meta: {},
      data: {
        PermissionsController: getOldState().PermissionsController,
      },
    };

    const newStorage = await migration68.migrate(oldStorage);
    const { PermissionController } = newStorage.data;

    expect(PermissionController).toStrictEqual(
      getExpectedPermissionControllerState(),
    );
  });

  it('should migrate the PermissionsMetadata state', async () => {
    const oldStorage = {
      meta: {},
      data: {
        PermissionsMetadata: getOldState().PermissionsMetadata,
      },
    };

    const newStorage = await migration68.migrate(oldStorage);
    const {
      PermissionLogController,
      SubjectMetadataController,
    } = newStorage.data;
    const expected = getOldState().PermissionsMetadata;

    expect(PermissionLogController.permissionHistory).toStrictEqual(
      expected.permissionsHistory,
    );
    expect(PermissionLogController.permissionActivityLog).toStrictEqual(
      expected.permissionsLog,
    );

    expect(SubjectMetadataController).toStrictEqual(
      getExpectedSubjectMetadataState(),
    );
  });

  it('should handle domain metadata edge cases', async () => {
    const oldStorage = {
      meta: {},
      data: {
        PermissionsMetadata: {
          domainMetadata: {
            'foo.bar': {
              // no name
              icon: 'fooIcon',
              extensionId: 'fooExtension', // non-null
              origin: null, // should get overwritten
              extraProperty: 'bar', // should be preserved
            },
          },
        },
      },
    };

    const newStorage = await migration68.migrate(oldStorage);
    expect(
      newStorage.data.SubjectMetadataController.subjectMetadata,
    ).toStrictEqual({
      'foo.bar': {
        name: 'foo.bar', // replaced with origin
        iconUrl: 'fooIcon', // preserved value, changed name
        extensionId: 'fooExtension', // preserved
        origin: 'foo.bar', // overwritten with correct origin
        extraProperty: 'bar', // preserved
      },
    });
  });
});

function getExpectedPermissionControllerState() {
  return {
    subjects: {
      'https://faucet.metamask.io': {
        origin: 'https://faucet.metamask.io',
        permissions: {
          eth_accounts: {
            caveats: [
              {
                type: 'restrictReturnedAccounts',
                value: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
              },
            ],
            date: 1597334833084,
            id: 'e01bada4-ddc7-47b6-be67-d4603733e0e9',
            invoker: 'https://faucet.metamask.io',
            parentCapability: 'eth_accounts',
          },
        },
      },
      'https://metamask.github.io': {
        origin: 'https://metamask.github.io',
        permissions: {
          eth_accounts: {
            caveats: [
              {
                type: 'restrictReturnedAccounts',
                value: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
              },
            ],
            date: 1616006369498,
            id: '3d0bdc27-e8e4-4fb0-a24b-340d61f6a3fa',
            invoker: 'https://metamask.github.io',
            parentCapability: 'eth_accounts',
          },
        },
      },
      'https://xdai.io': {
        origin: 'https://xdai.io',
        permissions: {
          eth_accounts: {
            caveats: [
              {
                type: 'restrictReturnedAccounts',
                value: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
              },
            ],
            date: 1605908022382,
            id: '88c5de24-11a9-4f1e-9651-b072f4c11928',
            invoker: 'https://xdai.io',
            parentCapability: 'eth_accounts',
          },
        },
      },
    },
  };
}

function getExpectedSubjectMetadataState() {
  return {
    subjectMetadata: {
      'https://1inch.exchange': {
        iconUrl: 'https://1inch.exchange/assets/favicon/favicon-32x32.png',
        name: 'DEX Aggregator - 1inch.exchange',
        origin: 'https://1inch.exchange',
        extensionId: null,
      },
      'https://ascii-tree-generator.com': {
        iconUrl: 'https://ascii-tree-generator.com/favicon.ico',
        name: 'ASCII Tree Generator',
        origin: 'https://ascii-tree-generator.com',
        extensionId: null,
      },
      'https://caniuse.com': {
        iconUrl: 'https://caniuse.com/img/favicon-128.png',
        name: 'Can I use... Support tables for HTML5, CSS3, etc',
        origin: 'https://caniuse.com',
        extensionId: null,
      },
      'https://core-geth.org': {
        iconUrl: 'https://core-geth.org/icons/icon-48x48.png',
        name: 'core-geth.org',
        origin: 'https://core-geth.org',
        extensionId: null,
      },
      'https://dao.society0x.org': {
        iconUrl: 'https://dao.society0x.org/favicon.ico',
        name: 'society0x',
        origin: 'https://dao.society0x.org',
        extensionId: null,
      },
      'https://docs.google.com': {
        iconUrl: null,
        name: 'docs.google.com',
        origin: 'https://docs.google.com',
        extensionId: null,
      },
      'https://docs.npmjs.com': {
        iconUrl: 'https://docs.npmjs.com/favicon-32x32.png',
        name: 'package-locks | npm Docs',
        origin: 'https://docs.npmjs.com',
        extensionId: null,
      },
      'https://drive.google.com': {
        iconUrl: null,
        name: 'drive.google.com',
        origin: 'https://drive.google.com',
        extensionId: null,
      },
      'https://duckduckgo.com': {
        iconUrl: null,
        name: 'duckduckgo.com',
        origin: 'https://duckduckgo.com',
        extensionId: null,
      },
      'https://eips.ethereum.org': {
        iconUrl: null,
        name: 'Ethereum Improvement Proposals',
        origin: 'https://eips.ethereum.org',
        extensionId: null,
      },
      'https://faucet.metamask.io': {
        iconUrl: null,
        name: 'Test Ether Faucet',
        origin: 'https://faucet.metamask.io',
        extensionId: null,
      },
      'https://files.slack.com': {
        iconUrl: null,
        name: 'img_20211123_131034.jpg (8000×6000)',
        origin: 'https://files.slack.com',
        extensionId: null,
      },
      'https://gist.github.com': {
        iconUrl: 'https://github.githubassets.com/favicons/favicon.png',
        name: 'Gist',
        origin: 'https://gist.github.com',
        extensionId: null,
      },
      'https://github.com': {
        iconUrl: 'https://github.githubassets.com/favicons/favicon.png',
        name: 'GitHub',
        origin: 'https://github.com',
        extensionId: null,
      },
      'https://headway-widget.net': {
        iconUrl: null,
        name: 'headway-widget.net',
        origin: 'https://headway-widget.net',
        extensionId: null,
      },
      'https://matcha.xyz': {
        iconUrl: 'https://matcha.xyz/favicon.ico',
        name: 'Matcha',
        origin: 'https://matcha.xyz',
        extensionId: null,
      },
      'https://medium.com': {
        iconUrl: 'https://miro.medium.com/1*m-R_BkNf1Qjr1YbyOIJY2w.png',
        name: 'Medium',
        origin: 'https://medium.com',
        extensionId: null,
      },
      'https://metamask.github.io': {
        iconUrl: null,
        name: 'MetaMask < = > Ledger Bridge',
        origin: 'https://metamask.github.io',
        extensionId: null,
      },
      'https://opensea.io': {
        iconUrl: 'https://opensea.io/static/images/favicon/32x32.png',
        name: 'OpenSea',
        origin: 'https://opensea.io',
        extensionId: null,
      },
      'https://sentry.io': {
        iconUrl:
          'https://s1.sentry-cdn.com/_static/aa8be2d373cced45f56eeb8d0af3a476/sentry/images/favicon.png',
        name: 'Sentry',
        origin: 'https://sentry.io',
        extensionId: null,
      },
      'https://wesbos.com': {
        iconUrl: 'https://wesbos.com/favicon.svg',
        name: 'Wes Bos',
        origin: 'https://wesbos.com',
        extensionId: null,
      },
      'https://www.ethdenver.com': {
        iconUrl:
          'https://images.squarespace-cdn.com/content/v1/614b990e002ad146a5478e8b/339800af-d572-4cb7-8415-861a9a1aa7cc/favicon.ico',
        name: 'ETHDenver 2022',
        origin: 'https://www.ethdenver.com',
        extensionId: null,
      },
      'https://www.google.com': {
        iconUrl: null,
        name: 'Redirecting',
        origin: 'https://www.google.com',
        extensionId: null,
      },
      'https://www.howtogeek.com': {
        iconUrl: 'https://www.howtogeek.com/public/favicon.ico',
        name: 'How-To Geek',
        origin: 'https://www.howtogeek.com',
        extensionId: null,
      },
      'https://www.linkedin.com': {
        iconUrl: 'https://static-exp1.licdn.com/sc/h/1bt1uwq5akv756knzdj4l6cdc',
        name: 'LinkedIn',
        origin: 'https://www.linkedin.com',
        extensionId: null,
      },
      'https://www.npmjs.com': {
        iconUrl:
          'https://static.npmjs.com/b0f1a8318363185cc2ea6a40ac23eeb2.png',
        name: 'npm',
        origin: 'https://www.npmjs.com',
        extensionId: null,
      },
      'https://www.youtube.com': {
        iconUrl: null,
        name: 'YouTube',
        origin: 'https://www.youtube.com',
        extensionId: null,
      },
      'https://xdai.io': {
        iconUrl: 'https://xdai.io/favicon.ico',
        name: 'Burner',
        origin: 'https://xdai.io',
        extensionId: null,
      },
    },
  };
}

function getOldState() {
  return {
    FooController: { a: 'b' }, // just to ensure it's not touched
    PermissionsController: {
      domains: {
        'https://faucet.metamask.io': {
          permissions: [
            {
              '@context': ['https://github.com/MetaMask/rpc-cap'],
              'caveats': [
                {
                  name: 'primaryAccountOnly',
                  type: 'limitResponseLength',
                  value: 1,
                },
                {
                  name: 'exposedAccounts',
                  type: 'filterResponse',
                  value: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
                },
              ],
              'date': 1597334833084,
              'id': 'e01bada4-ddc7-47b6-be67-d4603733e0e9',
              'invoker': 'https://faucet.metamask.io',
              'parentCapability': 'eth_accounts',
            },
          ],
        },
        'https://metamask.github.io': {
          permissions: [
            {
              '@context': ['https://github.com/MetaMask/rpc-cap'],
              'caveats': [
                {
                  name: 'primaryAccountOnly',
                  type: 'limitResponseLength',
                  value: 1,
                },
                {
                  name: 'exposedAccounts',
                  type: 'filterResponse',
                  value: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
                },
              ],
              'date': 1616006369498,
              'id': '3d0bdc27-e8e4-4fb0-a24b-340d61f6a3fa',
              'invoker': 'https://metamask.github.io',
              'parentCapability': 'eth_accounts',
            },
          ],
        },
        'https://xdai.io': {
          permissions: [
            {
              '@context': ['https://github.com/MetaMask/rpc-cap'],
              'caveats': [
                {
                  name: 'primaryAccountOnly',
                  type: 'limitResponseLength',
                  value: 1,
                },
                {
                  name: 'exposedAccounts',
                  type: 'filterResponse',
                  value: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
                },
              ],
              'date': 1605908022382,
              'id': '88c5de24-11a9-4f1e-9651-b072f4c11928',
              'invoker': 'https://xdai.io',
              'parentCapability': 'eth_accounts',
            },
          ],
        },
      },
      permissionsDescriptions: {},
      permissionsRequests: [],
    },
    PermissionsMetadata: {
      domainMetadata: {
        'https://1inch.exchange': {
          host: '1inch.exchange',
          icon: 'https://1inch.exchange/assets/favicon/favicon-32x32.png',
          lastUpdated: 1605489265143,
          name: 'DEX Aggregator - 1inch.exchange',
        },
        'https://ascii-tree-generator.com': {
          host: 'ascii-tree-generator.com',
          icon: 'https://ascii-tree-generator.com/favicon.ico',
          lastUpdated: 1637721988618,
          name: 'ASCII Tree Generator',
        },
        'https://caniuse.com': {
          host: 'caniuse.com',
          icon: 'https://caniuse.com/img/favicon-128.png',
          lastUpdated: 1637692936599,
          name: 'Can I use... Support tables for HTML5, CSS3, etc',
        },
        'https://core-geth.org': {
          host: 'core-geth.org',
          icon: 'https://core-geth.org/icons/icon-48x48.png',
          lastUpdated: 1637692093173,
          name: 'core-geth.org',
        },
        'https://dao.society0x.org': {
          host: 'dao.society0x.org',
          icon: 'https://dao.society0x.org/favicon.ico',
          lastUpdated: 1605281298395,
          name: 'society0x',
        },
        'https://docs.google.com': {
          host: 'docs.google.com',
          icon: null,
          lastUpdated: 1637706062624,
          name: 'docs.google.com',
        },
        'https://docs.npmjs.com': {
          host: 'docs.npmjs.com',
          icon: 'https://docs.npmjs.com/favicon-32x32.png',
          lastUpdated: 1637721451476,
          name: 'package-locks | npm Docs',
        },
        'https://drive.google.com': {
          host: 'drive.google.com',
          icon: null,
          lastUpdated: 1637697212783,
          name: 'drive.google.com',
        },
        'https://duckduckgo.com': {
          host: 'duckduckgo.com',
          icon: null,
          lastUpdated: 1637741361964,
          name: 'duckduckgo.com',
        },
        'https://eips.ethereum.org': {
          host: 'eips.ethereum.org',
          icon: null,
          lastUpdated: 1637741371848,
          name: 'Ethereum Improvement Proposals',
        },
        'https://faucet.metamask.io': {
          host: 'faucet.metamask.io',
          icon: null,
          lastUpdated: 1610405602124,
          name: 'Test Ether Faucet',
        },
        'https://files.slack.com': {
          host: 'files.slack.com',
          icon: null,
          lastUpdated: 1637692307280,
          name: 'img_20211123_131034.jpg (8000×6000)',
        },
        'https://gist.github.com': {
          host: 'gist.github.com',
          icon: 'https://github.githubassets.com/favicons/favicon.png',
          lastUpdated: 1637697928053,
          name: 'Gist',
        },
        'https://github.com': {
          host: 'github.com',
          icon: 'https://github.githubassets.com/favicons/favicon.png',
          lastUpdated: 1637742022784,
          name: 'GitHub',
        },
        'https://headway-widget.net': {
          host: 'headway-widget.net',
          icon: null,
          lastUpdated: 1637717496107,
          name: 'headway-widget.net',
        },
        'https://matcha.xyz': {
          host: 'matcha.xyz',
          icon: 'https://matcha.xyz/favicon.ico',
          lastUpdated: 1605488899058,
          name: 'Matcha',
        },
        'https://medium.com': {
          host: 'medium.com',
          icon: 'https://miro.medium.com/1*m-R_BkNf1Qjr1YbyOIJY2w.png',
          lastUpdated: 1637697902445,
          name: 'Medium',
        },
        'https://metamask.github.io': {
          host: 'metamask.github.io',
          icon: null,
          lastUpdated: 1637741464513,
          name: 'MetaMask < = > Ledger Bridge',
        },
        'https://opensea.io': {
          host: 'opensea.io',
          icon: 'https://opensea.io/static/images/favicon/32x32.png',
          lastUpdated: 1635365284983,
          name: 'OpenSea',
        },
        'https://sentry.io': {
          host: 'sentry.io',
          icon:
            'https://s1.sentry-cdn.com/_static/aa8be2d373cced45f56eeb8d0af3a476/sentry/images/favicon.png',
          lastUpdated: 1637690117917,
          name: 'Sentry',
        },
        'https://wesbos.com': {
          host: 'wesbos.com',
          icon: 'https://wesbos.com/favicon.svg',
          lastUpdated: 1637694835419,
          name: 'Wes Bos',
        },
        'https://www.ethdenver.com': {
          host: 'www.ethdenver.com',
          icon:
            'https://images.squarespace-cdn.com/content/v1/614b990e002ad146a5478e8b/339800af-d572-4cb7-8415-861a9a1aa7cc/favicon.ico',
          lastUpdated: 1637696210648,
          name: 'ETHDenver 2022',
        },
        'https://www.google.com': {
          host: 'www.google.com',
          icon: null,
          lastUpdated: 1637706056159,
          name: 'Redirecting',
        },
        'https://www.howtogeek.com': {
          host: 'www.howtogeek.com',
          icon: 'https://www.howtogeek.com/public/favicon.ico',
          lastUpdated: 1637721490407,
          name: 'How-To Geek',
        },
        'https://www.linkedin.com': {
          host: 'www.linkedin.com',
          icon: 'https://static-exp1.licdn.com/sc/h/1bt1uwq5akv756knzdj4l6cdc',
          lastUpdated: 1637696335837,
          name: 'LinkedIn',
        },
        'https://www.npmjs.com': {
          host: 'www.npmjs.com',
          icon: 'https://static.npmjs.com/b0f1a8318363185cc2ea6a40ac23eeb2.png',
          lastUpdated: 1637741973479,
          name: 'npm',
        },
        'https://www.youtube.com': {
          host: 'www.youtube.com',
          icon: null,
          lastUpdated: 1637697914908,
          name: 'YouTube',
        },
        'https://xdai.io': {
          host: 'xdai.io',
          icon: 'https://xdai.io/favicon.ico',
          lastUpdated: 1605908011518,
          name: 'Burner',
        },
      },
      permissionsHistory: {
        'https://opensea.io': {
          eth_accounts: {
            accounts: {
              '0xc42edfcc21ed14dda456aa0756c153f7985d8813': 1617399873696,
            },
            lastApproved: 1617399873696,
          },
        },
        'https://faucet.metamask.io': {
          eth_accounts: {
            accounts: {
              '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': 1620369333736,
            },
            lastApproved: 1610405614031,
          },
        },
        'https://metamask.github.io': {
          eth_accounts: {
            accounts: {
              '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': 1620759882723,
              '0xf9eab18b7db3adf8cd6bd5f4aed9e1d5e0e7f926': 1616005950557,
            },
            lastApproved: 1620759882723,
          },
        },
        'https://xdai.io': {
          eth_accounts: {
            accounts: {
              '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': 1620369333736,
            },
            lastApproved: 1605908022384,
          },
        },
      },
      permissionsLog: [
        {
          id: 1127195094,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 1127195094,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 1257,
          },
          requestTime: 1612673899742,
          response: {
            id: 1127195094,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1612673899742,
          success: true,
        },
        {
          id: 1289799093,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 1289799093,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 221,
          },
          requestTime: 1615220990517,
          response: {
            id: 1289799093,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615220990517,
          success: true,
        },
        {
          id: 3317998799,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'http://localhost:9011',
          request: {
            id: 3317998799,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'http://localhost:9011',
            tabId: 221,
          },
          requestTime: 1615221047113,
          response: {
            id: 3317998799,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615221047113,
          success: true,
        },
        {
          id: 3642448888,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3642448888,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 489,
          },
          requestTime: 1615325885561,
          response: {
            id: 3642448888,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615325885561,
          success: true,
        },
        {
          id: 3642448892,
          method: 'eth_requestAccounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3642448892,
            jsonrpc: '2.0',
            method: 'eth_requestAccounts',
            origin: 'https://metamask.github.io',
            tabId: 489,
          },
          requestTime: 1615325902525,
          response: {
            id: 3642448892,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1615325902526,
          success: true,
        },
        {
          id: 3642448893,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3642448893,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 489,
          },
          requestTime: 1615325959944,
          response: {
            id: 3642448893,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1615325959945,
          success: true,
        },
        {
          id: 522280579,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 522280579,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 489,
          },
          requestTime: 1615326256435,
          response: {
            id: 522280579,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615326256435,
          success: true,
        },
        {
          id: 522280583,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 522280583,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 489,
          },
          requestTime: 1615326270792,
          response: {
            id: 522280583,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615326270793,
          success: true,
        },
        {
          id: 522280584,
          method: 'eth_requestAccounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 522280584,
            jsonrpc: '2.0',
            method: 'eth_requestAccounts',
            origin: 'https://metamask.github.io',
            tabId: 489,
          },
          requestTime: 1615326323454,
          response: {
            id: 522280584,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1615326342445,
          success: true,
        },
        {
          id: 522280585,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 522280585,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 489,
          },
          requestTime: 1615326345615,
          response: {
            id: 522280585,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1615326345616,
          success: true,
        },
        {
          id: 148079893,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 148079893,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 282,
          },
          requestTime: 1615404026715,
          response: {
            id: 148079893,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615404026716,
          success: true,
        },
        {
          id: 1135559047,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 1135559047,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 124,
          },
          requestTime: 1615405825838,
          response: {
            id: 1135559047,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615405825838,
          success: true,
        },
        {
          id: 435140979,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 435140979,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 124,
          },
          requestTime: 1615405830625,
          response: {
            id: 435140979,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615405830625,
          success: true,
        },
        {
          id: 881133352,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 881133352,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 124,
          },
          requestTime: 1615405830840,
          response: {
            id: 881133352,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615405830840,
          success: true,
        },
        {
          id: 1931516355,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 1931516355,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 124,
          },
          requestTime: 1615405831561,
          response: {
            id: 1931516355,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615405831561,
          success: true,
        },
        {
          id: 3032542197,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3032542197,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 124,
          },
          requestTime: 1615405831768,
          response: {
            id: 3032542197,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615405831768,
          success: true,
        },
        {
          id: 1860572722,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 1860572722,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 124,
          },
          requestTime: 1615405832004,
          response: {
            id: 1860572722,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615405832004,
          success: true,
        },
        {
          id: 986453883,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 986453883,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 124,
          },
          requestTime: 1615405832242,
          response: {
            id: 986453883,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615405832242,
          success: true,
        },
        {
          id: 461818193,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 461818193,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 124,
          },
          requestTime: 1615405832523,
          response: {
            id: 461818193,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615405832523,
          success: true,
        },
        {
          id: 3012891724,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3012891724,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 124,
          },
          requestTime: 1615405985638,
          response: {
            id: 3012891724,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615405985638,
          success: true,
        },
        {
          id: 917795646,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 917795646,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 326,
          },
          requestTime: 1615406173134,
          response: {
            id: 917795646,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615406173134,
          success: true,
        },
        {
          id: 3301309542,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3301309542,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 326,
          },
          requestTime: 1615406176438,
          response: {
            id: 3301309542,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615406176439,
          success: true,
        },
        {
          id: 3669539249,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3669539249,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 326,
          },
          requestTime: 1615406327235,
          response: {
            id: 3669539249,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1615406327236,
          success: true,
        },
        {
          id: 1709528657,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'http://localhost:9011',
          request: {
            id: 1709528657,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'http://localhost:9011',
            tabId: 329,
          },
          requestTime: 1615406530746,
          response: {
            id: 1709528657,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615406530746,
          success: true,
        },
        {
          id: 1537139280,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'http://localhost:9011',
          request: {
            id: 1537139280,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'http://localhost:9011',
            tabId: 329,
          },
          requestTime: 1615406534755,
          response: {
            id: 1537139280,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615406534755,
          success: true,
        },
        {
          id: 2719287073,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'http://localhost:9011',
          request: {
            id: 2719287073,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'http://localhost:9011',
            tabId: 329,
          },
          requestTime: 1615406676011,
          response: {
            id: 2719287073,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615406676011,
          success: true,
        },
        {
          id: 1958093948,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'http://localhost:9011',
          request: {
            id: 1958093948,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'http://localhost:9011',
            tabId: 329,
          },
          requestTime: 1615406678730,
          response: {
            id: 1958093948,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615406678730,
          success: true,
        },
        {
          id: 676231926,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'http://localhost:9011',
          request: {
            id: 676231926,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'http://localhost:9011',
            tabId: 329,
          },
          requestTime: 1615406739097,
          response: {
            id: 676231926,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615406739097,
          success: true,
        },
        {
          id: 488494276,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 488494276,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 326,
          },
          requestTime: 1615406762317,
          response: {
            id: 488494276,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1615406762317,
          success: true,
        },
        {
          id: 200940686,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 200940686,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 326,
          },
          requestTime: 1615406780251,
          response: {
            id: 200940686,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1615406780252,
          success: true,
        },
        {
          id: 3791648250,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://artblocks.io',
          request: {
            id: 3791648250,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://artblocks.io',
            params: [],
            tabId: 510,
          },
          requestTime: 1615436903332,
          response: {
            id: 3791648250,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1615436903332,
          success: true,
        },
        {
          id: 3522620405,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3522620405,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 854,
          },
          requestTime: 1615573642266,
          response: {
            id: 3522620405,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1615573642267,
          success: true,
        },
        {
          id: 3570369948,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3570369948,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 298,
          },
          requestTime: 1616005918146,
          response: {
            id: 3570369948,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1616005918147,
          success: true,
        },
        {
          id: 3570369952,
          method: 'eth_requestAccounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3570369952,
            jsonrpc: '2.0',
            method: 'eth_requestAccounts',
            origin: 'https://metamask.github.io',
            tabId: 298,
          },
          requestTime: 1616005935304,
          response: {
            id: 3570369952,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1616005935308,
          success: true,
        },
        {
          id: 4132653,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 4132653,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 298,
          },
          requestTime: 1616005938261,
          response: {
            id: 4132653,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1616005938262,
          success: true,
        },
        {
          id: 3683157820,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3683157820,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 298,
          },
          requestTime: 1616005956990,
          response: {
            id: 3683157820,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1616005956990,
          success: true,
        },
        {
          id: 3683157824,
          method: 'eth_requestAccounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3683157824,
            jsonrpc: '2.0',
            method: 'eth_requestAccounts',
            origin: 'https://metamask.github.io',
            tabId: 298,
          },
          requestTime: 1616006363400,
          response: {
            id: 3683157824,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1616006369502,
          success: true,
        },
        {
          id: 3683157825,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3683157825,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 298,
          },
          requestTime: 1616006373463,
          response: {
            id: 3683157825,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1616006373464,
          success: true,
        },
        {
          id: 3683157826,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 3683157826,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 298,
          },
          requestTime: 1616006423353,
          response: {
            id: 3683157826,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1616006423354,
          success: true,
        },
        {
          id: 2423310131,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 2423310131,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 123,
          },
          requestTime: 1616085294550,
          response: {
            id: 2423310131,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1616085294550,
          success: true,
        },
        {
          id: 2155157620,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 2155157620,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 705,
          },
          requestTime: 1616352389395,
          response: {
            id: 2155157620,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1616352389396,
          success: true,
        },
        {
          id: 1677341698,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341698,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399837446,
          response: {
            id: 1677341698,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1617399837447,
          success: true,
        },
        {
          id: 1677341701,
          method: 'eth_requestAccounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341701,
            jsonrpc: '2.0',
            method: 'eth_requestAccounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399856577,
          response: {
            id: 1677341701,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399873696,
          success: true,
        },
        {
          id: 1677341703,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341703,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399873714,
          response: {
            id: 1677341703,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399873715,
          success: true,
        },
        {
          id: 1677341705,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341705,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399889776,
          response: {
            id: 1677341705,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399889779,
          success: true,
        },
        {
          id: 1677341707,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341707,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890058,
          response: {
            id: 1677341707,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890058,
          success: true,
        },
        {
          id: 1677341708,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341708,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890058,
          response: {
            id: 1677341708,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890059,
          success: true,
        },
        {
          id: 1677341709,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341709,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890062,
          response: {
            id: 1677341709,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890062,
          success: true,
        },
        {
          id: 1677341710,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341710,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890062,
          response: {
            id: 1677341710,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890063,
          success: true,
        },
        {
          id: 1677341715,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341715,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890089,
          response: {
            id: 1677341715,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890089,
          success: true,
        },
        {
          id: 1677341716,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341716,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890089,
          response: {
            id: 1677341716,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890090,
          success: true,
        },
        {
          id: 1677341719,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341719,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890097,
          response: {
            id: 1677341719,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890098,
          success: true,
        },
        {
          id: 1677341720,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341720,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890098,
          response: {
            id: 1677341720,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890099,
          success: true,
        },
        {
          id: 1677341723,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341723,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890404,
          response: {
            id: 1677341723,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890405,
          success: true,
        },
        {
          id: 1677341725,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341725,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890424,
          response: {
            id: 1677341725,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890424,
          success: true,
        },
        {
          id: 1677341728,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341728,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890769,
          response: {
            id: 1677341728,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890770,
          success: true,
        },
        {
          id: 1677341729,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341729,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890770,
          response: {
            id: 1677341729,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890771,
          success: true,
        },
        {
          id: 1677341730,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341730,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890771,
          response: {
            id: 1677341730,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890772,
          success: true,
        },
        {
          id: 1677341731,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341731,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890831,
          response: {
            id: 1677341731,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890831,
          success: true,
        },
        {
          id: 1677341736,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request: {
            id: 1677341736,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://opensea.io',
            params: [],
            tabId: 1290,
          },
          requestTime: 1617399890883,
          response: {
            id: 1677341736,
            jsonrpc: '2.0',
            result: ['0xc42edfcc21ed14dda456aa0756c153f7985d8813'],
          },
          responseTime: 1617399890883,
          success: true,
        },
        {
          id: 862239975,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 862239975,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 334,
          },
          requestTime: 1618258092041,
          response: {
            id: 862239975,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1618258092041,
          success: true,
        },
        {
          id: 862239979,
          method: 'eth_requestAccounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 862239979,
            jsonrpc: '2.0',
            method: 'eth_requestAccounts',
            origin: 'https://metamask.github.io',
            tabId: 334,
          },
          requestTime: 1618258202204,
          response: {
            id: 862239979,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1618258202205,
          success: true,
        },
        {
          id: 862239980,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 862239980,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 334,
          },
          requestTime: 1618258203750,
          response: {
            id: 862239980,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1618258203751,
          success: true,
        },
        {
          id: 862239981,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 862239981,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 334,
          },
          requestTime: 1618258315105,
          response: {
            id: 862239981,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1618258315106,
          success: true,
        },
        {
          id: 1274522275,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 1274522275,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 317,
          },
          requestTime: 1618871771870,
          response: {
            id: 1274522275,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1618871771870,
          success: true,
        },
        {
          id: 2076125974,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://app.reflexer.finance',
          request: {
            id: 2076125974,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://app.reflexer.finance',
            tabId: 780,
          },
          requestTime: 1619760364186,
          response: {
            id: 2076125974,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1619760364187,
          success: true,
        },
        {
          id: 2387411649,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 2387411649,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 1388,
          },
          requestTime: 1620080656237,
          response: {
            id: 2387411649,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1620080656238,
          success: true,
        },
        {
          id: 2214093777,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 2214093777,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 481,
          },
          requestTime: 1620614333399,
          response: {
            id: 2214093777,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1620614333399,
          success: true,
        },
        {
          id: 2960964763,
          method: 'wallet_getPermissions',
          methodType: 'internal',
          origin: 'https://metamask.github.io',
          request: {
            id: 2960964763,
            jsonrpc: '2.0',
            method: 'wallet_getPermissions',
            origin: 'https://metamask.github.io',
            tabId: 145,
          },
          requestTime: 1620759866273,
          response: {
            id: 2960964763,
            jsonrpc: '2.0',
            result: [
              {
                '@context': ['https://github.com/MetaMask/rpc-cap'],
                'caveats': [
                  {
                    name: 'primaryAccountOnly',
                    type: 'limitResponseLength',
                    value: 1,
                  },
                  {
                    name: 'exposedAccounts',
                    type: 'filterResponse',
                    value: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
                  },
                ],
                'date': 1616006369498,
                'id': '3d0bdc27-e8e4-4fb0-a24b-340d61f6a3fa',
                'invoker': 'https://metamask.github.io',
                'parentCapability': 'eth_accounts',
              },
            ],
          },
          responseTime: 1620759866273,
          success: true,
        },
        {
          id: 2960964764,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 2960964764,
            jsonrpc: '2.0',
            method: 'eth_accounts',
            origin: 'https://metamask.github.io',
            tabId: 145,
          },
          requestTime: 1620759866280,
          response: {
            id: 2960964764,
            jsonrpc: '2.0',
            result: [],
          },
          responseTime: 1620759866280,
          success: true,
        },
        {
          id: 2960964766,
          method: 'eth_requestAccounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request: {
            id: 2960964766,
            jsonrpc: '2.0',
            method: 'eth_requestAccounts',
            origin: 'https://metamask.github.io',
            tabId: 145,
          },
          requestTime: 1620759878553,
          response: {
            id: 2960964766,
            jsonrpc: '2.0',
            result: ['0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'],
          },
          responseTime: 1620759882723,
          success: true,
        },
        {
          id: 1850474494,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request:
            '{\n  "method": "eth_accounts",\n  "jsonrpc": "2.0",\n  "id": 1850474494,\n  "origin": "https://metamask.github.io",\n  "tabId": 1415\n}',
          requestTime: 1622042803532,
          response:
            '{\n  "id": 1850474494,\n  "jsonrpc": "2.0",\n  "result": []\n}',
          responseTime: 1622042803532,
          success: true,
        },
        {
          id: 2260148347,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request:
            '{\n  "method": "eth_accounts",\n  "jsonrpc": "2.0",\n  "id": 2260148347,\n  "origin": "https://metamask.github.io",\n  "tabId": 518\n}',
          requestTime: 1626802974114,
          response:
            '{\n  "id": 2260148347,\n  "jsonrpc": "2.0",\n  "result": []\n}',
          responseTime: 1626802974114,
          success: true,
        },
        {
          id: 2778698744,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request:
            '{\n  "method": "eth_accounts",\n  "jsonrpc": "2.0",\n  "id": 2778698744,\n  "origin": "https://metamask.github.io",\n  "tabId": 980\n}',
          requestTime: 1628623482844,
          response:
            '{\n  "id": 2778698744,\n  "jsonrpc": "2.0",\n  "result": []\n}',
          responseTime: 1628623482844,
          success: true,
        },
        {
          id: 986806944,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request:
            '{\n  "method": "eth_accounts",\n  "jsonrpc": "2.0",\n  "id": 986806944,\n  "origin": "https://metamask.github.io",\n  "tabId": 1368\n}',
          requestTime: 1629304275762,
          response:
            '{\n  "id": 986806944,\n  "jsonrpc": "2.0",\n  "result": []\n}',
          responseTime: 1629304275763,
          success: true,
        },
        {
          id: 687491263,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://metamask.github.io',
          request:
            '{\n  "method": "eth_accounts",\n  "jsonrpc": "2.0",\n  "id": 687491263,\n  "origin": "https://metamask.github.io",\n  "tabId": 2579\n}',
          requestTime: 1630514613078,
          response:
            '{\n  "id": 687491263,\n  "jsonrpc": "2.0",\n  "result": []\n}',
          responseTime: 1630514613078,
          success: true,
        },
        {
          id: 2594469932,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 2594469932,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 975\n}',
          requestTime: 1631115154866,
          response:
            '{\n  "id": 2594469932,\n  "jsonrpc": "2.0",\n  "result": []\n}',
          responseTime: 1631115154866,
          success: true,
        },
        {
          id: 2594469933,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 2594469933,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 975\n}',
          requestTime: 1631115154867,
          response:
            '{\n  "id": 2594469933,\n  "jsonrpc": "2.0",\n  "result": []\n}',
          responseTime: 1631115154867,
          success: true,
        },
        {
          id: 2594469937,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 2594469937,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 975\n}',
          requestTime: 1631115155174,
          response:
            '{\n  "id": 2594469937,\n  "jsonrpc": "2.0",\n  "result": []\n}',
          responseTime: 1631115155174,
          success: true,
        },
        {
          id: 2594469938,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 2594469938,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 975\n}',
          requestTime: 1631115155243,
          response:
            '{\n  "id": 2594469938,\n  "jsonrpc": "2.0",\n  "result": []\n}',
          responseTime: 1631115155243,
          success: true,
        },
        {
          id: 2594469941,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 2594469941,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 975\n}',
          requestTime: 1631115156814,
          response:
            '{\n  "id": 2594469941,\n  "jsonrpc": "2.0",\n  "result": []\n}',
          responseTime: 1631115156814,
          success: true,
        },
        {
          id: 2594469942,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 2594469942,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 975\n}',
          requestTime: 1631115156814,
          response:
            '{\n  "id": 2594469942,\n  "jsonrpc": "2.0",\n  "result": []\n}',
          responseTime: 1631115156814,
          success: true,
        },
        {
          id: 93579192,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 93579192,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 2443\n}',
          requestTime: 1635365284647,
          response:
            '{\n  "id": 93579192,\n  "jsonrpc": "2.0",\n  "result": [\n    "0xc42edfcc21ed14dda456aa0756c153f7985d8813"\n  ]\n}',
          responseTime: 1635365284648,
          success: true,
        },
        {
          id: 93579193,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 93579193,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 2443\n}',
          requestTime: 1635365284648,
          response:
            '{\n  "id": 93579193,\n  "jsonrpc": "2.0",\n  "result": [\n    "0xc42edfcc21ed14dda456aa0756c153f7985d8813"\n  ]\n}',
          responseTime: 1635365284648,
          success: true,
        },
        {
          id: 93579197,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 93579197,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 2443\n}',
          requestTime: 1635365285121,
          response:
            '{\n  "id": 93579197,\n  "jsonrpc": "2.0",\n  "result": [\n    "0xc42edfcc21ed14dda456aa0756c153f7985d8813"\n  ]\n}',
          responseTime: 1635365285122,
          success: true,
        },
        {
          id: 93579198,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 93579198,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 2443\n}',
          requestTime: 1635365285122,
          response:
            '{\n  "id": 93579198,\n  "jsonrpc": "2.0",\n  "result": [\n    "0xc42edfcc21ed14dda456aa0756c153f7985d8813"\n  ]\n}',
          responseTime: 1635365285122,
          success: true,
        },
        {
          id: 93579199,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 93579199,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 2443\n}',
          requestTime: 1635365285317,
          response:
            '{\n  "id": 93579199,\n  "jsonrpc": "2.0",\n  "result": [\n    "0xc42edfcc21ed14dda456aa0756c153f7985d8813"\n  ]\n}',
          responseTime: 1635365285317,
          success: true,
        },
        {
          id: 93579202,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 93579202,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 2443\n}',
          requestTime: 1635365285348,
          response:
            '{\n  "id": 93579202,\n  "jsonrpc": "2.0",\n  "result": [\n    "0xc42edfcc21ed14dda456aa0756c153f7985d8813"\n  ]\n}',
          responseTime: 1635365285348,
          success: true,
        },
        {
          id: 93579206,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 93579206,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 2443\n}',
          requestTime: 1635365285983,
          response:
            '{\n  "id": 93579206,\n  "jsonrpc": "2.0",\n  "result": [\n    "0xc42edfcc21ed14dda456aa0756c153f7985d8813"\n  ]\n}',
          responseTime: 1635365285984,
          success: true,
        },
        {
          id: 93579207,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 93579207,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 2443\n}',
          requestTime: 1635365285984,
          response:
            '{\n  "id": 93579207,\n  "jsonrpc": "2.0",\n  "result": [\n    "0xc42edfcc21ed14dda456aa0756c153f7985d8813"\n  ]\n}',
          responseTime: 1635365285985,
          success: true,
        },
        {
          id: 93579211,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 93579211,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 2443\n}',
          requestTime: 1635365286261,
          response:
            '{\n  "id": 93579211,\n  "jsonrpc": "2.0",\n  "result": [\n    "0xc42edfcc21ed14dda456aa0756c153f7985d8813"\n  ]\n}',
          responseTime: 1635365286262,
          success: true,
        },
        {
          id: 93579213,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 93579213,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 2443\n}',
          requestTime: 1635365286279,
          response:
            '{\n  "id": 93579213,\n  "jsonrpc": "2.0",\n  "result": [\n    "0xc42edfcc21ed14dda456aa0756c153f7985d8813"\n  ]\n}',
          responseTime: 1635365286279,
          success: true,
        },
        {
          id: 93579216,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 93579216,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 2443\n}',
          requestTime: 1635365286391,
          response:
            '{\n  "id": 93579216,\n  "jsonrpc": "2.0",\n  "result": [\n    "0xc42edfcc21ed14dda456aa0756c153f7985d8813"\n  ]\n}',
          responseTime: 1635365286391,
          success: true,
        },
        {
          id: 93579218,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'https://opensea.io',
          request:
            '{\n  "jsonrpc": "2.0",\n  "id": 93579218,\n  "method": "eth_accounts",\n  "params": [],\n  "origin": "https://opensea.io",\n  "tabId": 2443\n}',
          requestTime: 1635365286408,
          response:
            '{\n  "id": 93579218,\n  "jsonrpc": "2.0",\n  "result": [\n    "0xc42edfcc21ed14dda456aa0756c153f7985d8813"\n  ]\n}',
          responseTime: 1635365286408,
          success: true,
        },
        {
          id: 519616456,
          method: 'eth_accounts',
          methodType: 'restricted',
          origin: 'http://localhost:9011',
          request:
            '{\n  "method": "eth_accounts",\n  "jsonrpc": "2.0",\n  "id": 519616456,\n  "origin": "http://localhost:9011",\n  "tabId": 1020\n}',
          requestTime: 1636479612050,
          response:
            '{\n  "id": 519616456,\n  "jsonrpc": "2.0",\n  "result": []\n}',
          responseTime: 1636479612051,
          success: true,
        },
      ],
    },
  };
}
