import * as React from 'react';
import * as _ from 'lodash';
const ifvisible = require('ifvisible.js');
import { useRecoilState } from 'recoil';

import state from 'src/recoil';
import firebase from 'src/firebase';
import constant from 'src/constants';
import { pushNotification } from 'src/util';

// Twitter
export const useTwitter = () => {
  const [uid, ____] = useRecoilState(state.uid);
  const [__, setLoading] = useRecoilState(state.loading);
  const [___, setPopUp] = useRecoilState(state.popUp);

  const login = () => {
    // ローディング画面にする
    setLoading(true);

    setPopUp(true);

    // delete connections
    firebase.database().ref(constant.table.connections).child(uid).remove();

    const provider = new firebase.auth.TwitterAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(async result => {
        location.reload();
      })
      .catch(e => location.reload());
  };

  const logout = () => {
    firebase.database().goOffline();
    firebase
      .auth()
      .signOut()
      .then(() => {
        location.reload();
      })
      .catch(error => {});
  };

  return { login, logout };
};

// 画面監視
export const useDisplay = () => {
  const [popUp, __] = useRecoilState(state.popUp);
  const [active, setActive] = React.useState(true);
  const [init, setInit] = React.useState(false);

  ifvisible.on('focus', async () => {
    setActive(true);
  });

  ifvisible.on('blur', async () => {
    setActive(false);

    // 切断
    firebase.database().goOffline();
  });

  React.useMemo(() => {
    if (active && init && !popUp) {
      // 再接続処理
      firebase.database().goOnline();
    }

    if (!init) {
      setInit(true);
    }
  }, [active]);

  return {};
};

// 投稿
export const usePost = () => {
  const [uid, __] = useRecoilState(state.uid);
  const [uname, ___] = useRecoilState(state.uname);
  const [message, setMessage] = useRecoilState(state.message);

  const post = async () => {
    const _message = message;
    if (uname.trim().length === 0) {
      alert('ハンネを入力してください');
      return;
    }

    if (message.trim().length === 0) {
      alert('メッセージを入力してください');
      return;
    }

    setMessage('');
    document.getElementById('textarea')?.blur();

    await firebase.database().ref(constant.table.boards).push({
      uid: uid,
      uname: uname,
      message: _message.trim(),
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });

    document.getElementById('textarea')?.focus();

    // lineに通知
    pushNotification(`${uid}\n\n${message}`);
  };

  return { post };
};

// 初期化
export const useInit = () => {
  const [__, setUid] = useRecoilState(state.uid);
  const [___, setList] = useRecoilState(state.list);
  const [____, setSu] = useRecoilState(state.su);
  const [_____, setLoading] = useRecoilState(state.loading);
  const [______, setSnsLogin] = useRecoilState(state.snsLogin);

  const _connectionMonitoring = async () => {
    const presenceRef = firebase.database().ref('/.info/connected');
    const listRef = firebase
      .database()
      .ref(
        (constant.table.connections +
          '/' +
          (await firebase.auth().currentUser?.uid)) as string
      );
    const userRef = listRef.push();

    presenceRef.on('value', async snap => {
      if (snap.val()) {
        userRef.onDisconnect().remove();
        userRef.set((await firebase.auth().currentUser?.uid) as string);
      }
    });

    firebase
      .database()
      .ref('connections')
      .on('value', s => {
        setSu(s.numChildren());
      });
  };

  const _list = () => {
    firebase
      .database()
      .ref(constant.table.boards)
      .orderByChild('createdAt')
      .limitToLast(50)
      .on('value', snapshot => {
        let _data: any[] = [];
        snapshot.forEach(childSnapshot => {
          _data.push(childSnapshot.val());
        });

        setList(_.orderBy(_data, 'createdAt', 'desc'));
        setLoading(false);

        _connectionMonitoring();
      });
  };

  React.useEffect(() => {
    firebase.auth().onAuthStateChanged(async data => {
      if (data === null) {
        // 匿名ログイン
        await firebase.auth().signInAnonymously();
        return;
      }

      data.providerData.length !== 0 ? setSnsLogin(true) : '';

      // lineに通知
      pushNotification((await firebase.auth().currentUser?.uid) as string);

      _list();
      setUid((await firebase.auth().currentUser?.uid) as string);
    });
  }, []);

  return {};
};
