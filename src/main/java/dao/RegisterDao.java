package dao;

import entity.UsertableEntity;

/**
 * Created by Administrator on 2015/6/6.
 */
public interface RegisterDao {
    String checkregister(String username, String password, String email);
    String checkregister(String username, String password, String email, String password2);


    void create(UsertableEntity usertableEntity);

    void remove(UsertableEntity usertableEntity);

    void update(UsertableEntity usertableEntity);
}
