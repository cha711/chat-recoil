import * as React from 'react';
import { useRecoilState } from 'recoil';
import state from 'src/recoil';
import { usePost } from 'src/hooks';

export default () => {
  const [uname, setUname] = useRecoilState(state.uname);
  const [message, setMessage] = useRecoilState(state.message);

  const { post } = usePost();

  return React.useMemo(() => {
    return (
      <>
        <div className="form-group text-center">
          <input
            maxLength={15}
            placeholder="ハンネ"
            size={30}
            value={uname}
            onChange={e => setUname(e.target.value)}
          />
        </div>

        <div className="form-group">
          <textarea
            style={{ maxWidth: 400, margin: '0 auto' }}
            className="form-control"
            id="textarea"
            placeholder="メッセージ 150文字以内"
            maxLength={150}
            value={message}
            rows={3}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => (e.keyCode === 13 ? post() : '')}
          ></textarea>

          <div className="text-center">
            <button className="btn btn-primary" onClick={() => post()}>
              投稿
            </button>
          </div>
        </div>

        <hr />
      </>
    );
  }, [message, uname]);
};
