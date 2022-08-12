
(function () {
    'use strict';
    kintone.events.on('app.record.index.show', function (event) {
        // 増殖バグを防ぐ
        if (document.getElementById('my_index_button') !== null) {
            return;
        }
        // ボタン
        const myIndexButton = document.createElement('button');
        myIndexButton.id = 'my_index_button';
        myIndexButton.innerText = '一覧のボタン';

        // ボタンクリック時の処理
        myIndexButton.onclick = function () {
            const myHeaderSpace = kintone.app.getHeaderMenuSpaceElement();
            const myListHeaderDiv = document.createElement('div');
            myListHeaderDiv.style.width = '100%';
            myListHeaderDiv.style.height = '35px';
            myListHeaderDiv.style.textAlign = 'center';
            myListHeaderDiv.style.fontSize = '30px';
            myListHeaderDiv.style.fontWeight = 'bold';
            myListHeaderDiv.style.backgroundColor = '#ffd78c';
            myListHeaderDiv.innerText = '押されて飛び出てじゃじゃじゃじゃじゃーん';

            // メニューの下側の空白部分に文字列を表示
            myHeaderSpace.innerText = ''; // 増殖を防ぐため一旦明治的に空文字をセット
            myHeaderSpace.appendChild(myListHeaderDiv);
        };

        // メニューの右側の空白部分にボタンを設置
        kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);
    });
})();
