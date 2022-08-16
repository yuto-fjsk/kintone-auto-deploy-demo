const path = require('path');
const fs = require('fs');
const {execSync} = require('child_process');

const SEARCH_DIR = 'kintone/apps' // このディレクトリ配下でcustomize-manifest.jsonファイルを探す
const COMMAND = `npx kintone-customize-uploader --base-url ${process.env.KINTONE_BASE_URL} --username ${process.env.KINTONE_USER} --password ${process.env.KINTONE_PASSWORD} `;

// 変更があったパスに含まれるcustomize-manifestファイルの一覧を取得
const manifestFilePaths = getManifestFilePaths();

// kintone-customize-uploaderを使い、kintoneアプリをデプロイ
manifestFilePaths.forEach(manifestFilePath => {
    console.log('\nuploading... ', manifestFilePath);
    const result = execSync(COMMAND + manifestFilePath);
    console.log('\n' + result);
});

/**
 * @return customize-manifestファイルのファイルパスのリスト
 */
function getManifestFilePaths() {
    const changedFiles = process.argv.slice(2);
    console.log(changedFiles);
    
    const apps = changedFiles.filter(changedFile => {
        return changedFile.startsWith(SEARCH_DIR);
    })
    console.log('apps', apps);
    
    const dirNames = apps.map(app => {
        return path.dirname(app);
    })
    console.log('dirNames', dirNames);
    
    const uniqueDirNames = new Set(dirNames);
    console.log('uniqueDirNames', uniqueDirNames);
    
    const manifestFilePaths = [];
    uniqueDirNames.forEach(dirName => {
        try {
            findCustomizeManifestFilePath(dirName).forEach(customizeManifestFilePath => {
                manifestFilePaths.push(customizeManifestFilePath);
            });
        } catch (error) {
            console.error(error);
        }
    });
    console.log(manifestFilePaths);

    return new Set(manifestFilePaths);
}

/**
 * @param  {} dirName ファイル変更があったディレクトリ名
 * @return customize-manifestのファイルパスのリスト
 */
function findCustomizeManifestFilePath(dirName) {
    console.log('dirName', dirName);
    if (dirName.indexOf('\\') !== -1) {
        dirName = decodeDirectoryPath(dirName)
    }
    const fileNames = fs.readdirSync(dirName);
    console.log('fileNames', fileNames);
    const customizeManifestFileNames = fileNames.filter(fileName => {
        const filePath = path.join(dirName, fileName);
        console.debug('filePath', filePath);
        const customizeManifestFileReg = new RegExp(`customize-manifest-${process.env.ENV}\.json$`)
        return fs.statSync(filePath).isFile() && customizeManifestFileReg.test(filePath);
    });
    // customize-manifestが見つかるとファイルパスを返す
    if (customizeManifestFileNames.length > 0) {
        return customizeManifestFileNames.map(customizeManifestFileName => {
            return path.join(dirName, customizeManifestFileName);
        });
    }

    // 規定のディレクトリまで遡った場合やリポジトリのトップディレクトリまで遡った場合に処理を打ち切る
    if (dirName === SEARCH_DIR || dirName === '.') {
        return [];
    }

    // 一階層上のディレクトリパスを探す
    return findCustomizeManifestFilePath(path.dirname(dirName));
}

/**
 * @param  {} dirName 8進数にエンコードされた日本語文字列を含むディレクトリ名
 * @return 日本語文字列にデコードされたディレクトリ名
 */
function decodeDirectoryPath(dirName) {
    const first = dirName.indexOf('\\');
    const end = dirName.lastIndexOf('\\');
    console.log('first', first, 'end', end);
    // UTF-8で日本語文字を扱う場合は3バイト必要になる
    // 参考：https://ja.wikipedia.org/wiki/UTF-8#:~:text=UTF%2D8%E3%81%AB%E3%82%88%E3%82%8B%E7%AC%A6%E5%8F%B7%E5%8C%96%E3%81%A7%E3%81%AF%E3%80%81%E6%BC%A2%E5%AD%97%E3%82%84%E4%BB%AE%E5%90%8D%E3%81%AA%E3%81%A9%E3%81%AE%E8%A1%A8%E7%8F%BE%E3%81%AB3%E3%83%90%E3%82%A4%E3%83%88%E3%82%92%E8%A6%81%E3%81%99%E3%82%8B%E3%80%82
    // このため、バックスラッシュを加味した4文字分endをずらす
    const encodedDirName = dirName.slice(first, end + 4);
    console.log(encodedDirName);

    // バックスラッシュで分割すると先頭が空文字になる。そのままデコードするとNULL文字扱いされるためフィルタをかける
    const splitedByEscape = encodedDirName.split('\\').filter(char => char.length > 0);;
    console.debug('splited', splitedByEscape);

    // エンコードされた文字は8進数のため、parseIntで整数値(2進数)に変換をかけた後、UTF-8にデコードする
    // 参考：https://qiita.com/n0bisuke/items/1872b3217c3bb9aba507
    const buf = new Buffer.from(new Uint8Array(splitedByEscape.map(char => parseInt(char, 8))));
    const decoded = buf.toString('utf-8');
    const decodedDirName = dirName.replace(encodedDirName, decoded);
    console.log(decodedDirName);

    return decodedDirName
}