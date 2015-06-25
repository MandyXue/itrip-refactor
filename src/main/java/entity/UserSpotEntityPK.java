package entity;

import javax.persistence.Column;
import javax.persistence.Id;
import java.io.Serializable;

/**
 * Created by mandyxue on 15/6/25.
 */
public class UserSpotEntityPK implements Serializable {
    private String username;
    private String spotname;
    private String type;

    @Column(name = "username", nullable = false, insertable = true, updatable = true, length = 15)
    @Id
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Column(name = "spotname", nullable = false, insertable = true, updatable = true, length = 30)
    @Id
    public String getSpotname() {
        return spotname;
    }

    public void setSpotname(String spotname) {
        this.spotname = spotname;
    }

    @Column(name = "type", nullable = false, insertable = true, updatable = true, length = 15)
    @Id
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        UserSpotEntityPK that = (UserSpotEntityPK) o;

        if (spotname != null ? !spotname.equals(that.spotname) : that.spotname != null) return false;
        if (type != null ? !type.equals(that.type) : that.type != null) return false;
        if (username != null ? !username.equals(that.username) : that.username != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = username != null ? username.hashCode() : 0;
        result = 31 * result + (spotname != null ? spotname.hashCode() : 0);
        result = 31 * result + (type != null ? type.hashCode() : 0);
        return result;
    }
}
